const express = require('express');
const db = require('../utils/db.include');
const { requireAuth } = require('../middleware/auth');
const { positiveInteger, validateRecipe } = require('../utils/validation');

const router = express.Router();

function sendDatabaseError(res, error, operation) {
    console.error(`${operation} failed:`, error.code || error.message);
    return res.status(500).json({ error: `Unable to ${operation}.` });
}

async function loadRecipeDetails(recipes, includeReviews = false, executor = db) {
    if (!recipes.length) return recipes;

    const recipeIds = recipes.map((recipe) => recipe.recipe_id);
    const placeholders = recipeIds.map(() => '?').join(', ');

    const [ingredients] = await executor.execute(
        `SELECT ri.recipe_id, ri.ingredient_id, i.ingredient_name,
                ri.quantity, ri.unit_of_measure
         FROM RECIPE_INGREDIENT ri
         JOIN INGREDIENT i ON i.ingredient_id = ri.ingredient_id
         WHERE ri.recipe_id IN (${placeholders})
         ORDER BY ri.recipe_id, i.ingredient_name`,
        recipeIds,
    );
    const [steps] = await executor.execute(
        `SELECT step_id, recipe_id, step_number, instruction
         FROM PREPARATION_STEP
         WHERE recipe_id IN (${placeholders})
         ORDER BY recipe_id, step_number`,
        recipeIds,
    );
    const reviews = includeReviews
        ? (await executor.execute(
            `SELECT rv.review_id, rv.recipe_id, rv.user_id, rv.rating, rv.comment,
                    rv.created_at, u.username AS reviewer
             FROM REVIEW rv
             JOIN USER u ON u.user_id = rv.user_id
             WHERE rv.recipe_id IN (${placeholders})
             ORDER BY rv.created_at DESC`,
            recipeIds,
        ))[0]
        : [];

    return recipes.map((recipe) => ({
        ...recipe,
        averageRating: recipe.averageRating == null ? null : Number(recipe.averageRating),
        reviewCount: Number(recipe.reviewCount || 0),
        ingredients: ingredients
            .filter((ingredient) => ingredient.recipe_id === recipe.recipe_id)
            .map((ingredient) => ({
                ...ingredient,
                quantity: Number(ingredient.quantity),
            })),
        preparationSteps: steps.filter((step) => step.recipe_id === recipe.recipe_id),
        reviews: reviews.filter((review) => review.recipe_id === recipe.recipe_id),
    }));
}

async function findRecipes({ recipeId } = {}, executor = db) {
    const where = recipeId ? 'WHERE r.recipe_id = ?' : '';
    const params = recipeId ? [recipeId] : [];
    const [recipes] = await executor.execute(
        `SELECT r.recipe_id, r.user_id, r.title, r.category, r.description,
                r.photo_url, r.preparation_time, r.created_at, r.glass_name, r.capacity_cl,
                u.username AS creator,
                (SELECT ROUND(AVG(rv.rating), 1)
                 FROM REVIEW rv WHERE rv.recipe_id = r.recipe_id) AS averageRating,
                (SELECT COUNT(*)
                 FROM REVIEW rv WHERE rv.recipe_id = r.recipe_id) AS reviewCount
         FROM RECIPE r
         JOIN USER u ON u.user_id = r.user_id
         ${where}
         ORDER BY r.created_at DESC, r.recipe_id DESC`,
        params,
    );
    return recipes;
}

router.get('/ingredients', async (_req, res) => {
    try {
        const [ingredients] = await db.execute(
            `SELECT ingredient_id, ingredient_name, alcohol_degree, allergens,
                    average_price, image_url, is_legal, category_name
             FROM INGREDIENT
             ORDER BY ingredient_name`,
        );
        return res.json(ingredients);
    } catch (error) {
        return sendDatabaseError(res, error, 'load ingredients');
    }
});

router.post('/recipes', requireAuth, async (req, res) => {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const recipe = body.recipe && typeof body.recipe === 'object' ? body.recipe : {};
    const payload = {
        ...recipe,
        recipe_ingredients: body.recipe_ingredients,
        preparation_steps: body.preparation_steps,
    };
    const errors = validateRecipe(payload);
    if (errors.length) {
        return res.status(400).json({ error: errors[0], details: errors });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const ingredientIds = payload.recipe_ingredients.map((item) => positiveInteger(item.ingredient_id));
        const placeholders = ingredientIds.map(() => '?').join(', ');
        const [existingIngredients] = await connection.execute(
            `SELECT ingredient_id FROM INGREDIENT WHERE ingredient_id IN (${placeholders})`,
            ingredientIds,
        );
        if (existingIngredients.length !== ingredientIds.length) {
            await connection.rollback();
            return res.status(400).json({ error: 'One or more selected ingredients do not exist.' });
        }

        const [result] = await connection.execute(
            `INSERT INTO RECIPE
                (user_id, title, category, description, photo_url, preparation_time, glass_name, capacity_cl)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                req.session.userId,
                recipe.title.trim(),
                recipe.category.trim(),
                recipe.description?.trim() || null,
                recipe.photo_url?.trim() || null,
                recipe.preparation_time == null || recipe.preparation_time === ''
                    ? null
                    : Number(recipe.preparation_time),
                recipe.glass_name.trim(),
                Number(recipe.capacity_cl),
            ],
        );

        for (const ingredient of payload.recipe_ingredients) {
            await connection.execute(
                `INSERT INTO RECIPE_INGREDIENT (recipe_id, ingredient_id, quantity, unit_of_measure)
                 VALUES (?, ?, ?, ?)`,
                [
                    result.insertId,
                    Number(ingredient.ingredient_id),
                    Number(ingredient.quantity),
                    ingredient.unit_of_measure.trim(),
                ],
            );
        }

        for (const [index, step] of payload.preparation_steps.entries()) {
            await connection.execute(
                `INSERT INTO PREPARATION_STEP (recipe_id, step_number, instruction)
                 VALUES (?, ?, ?)`,
                [result.insertId, index + 1, step.instruction.trim()],
            );
        }

        const createdRecipes = await findRecipes({ recipeId: result.insertId }, connection);
        const [createdRecipe] = await loadRecipeDetails(createdRecipes, true, connection);
        await connection.commit();
        return res.status(201).json(createdRecipe);
    } catch (error) {
        await connection.rollback().catch((rollbackError) => {
            console.error('Unable to rollback recipe creation:', rollbackError.code || rollbackError.message);
        });
        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({ error: 'One or more selected ingredients do not exist.' });
        }
        console.error('Unable to create recipe:', error.code || error.message);
        return res.status(500).json({ error: 'Unable to create recipe.' });
    } finally {
        connection.release();
    }
});

async function listRecipes(_req, res) {
    try {
        const recipes = await findRecipes();
        return res.json(await loadRecipeDetails(recipes));
    } catch (error) {
        return sendDatabaseError(res, error, 'load recipes');
    }
}

router.get('/list', listRecipes);
router.get('/recipes', listRecipes);

router.get('/recipes/:recipeId', async (req, res) => {
    const recipeId = Number(req.params.recipeId);
    if (!Number.isSafeInteger(recipeId) || recipeId < 1) {
        return res.status(400).json({ error: 'Recipe id must be a positive integer.' });
    }

    try {
        const recipes = await findRecipes({ recipeId });
        if (!recipes.length) {
            return res.status(404).json({ error: 'Recipe not found.' });
        }
        const [recipe] = await loadRecipeDetails(recipes, true);
        return res.json(recipe);
    } catch (error) {
        return sendDatabaseError(res, error, 'load recipe');
    }
});

module.exports = router;
