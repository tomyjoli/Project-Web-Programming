const express = require('express');
const db = require('../utils/db.include');

const router = express.Router();

function sendDatabaseError(res, error, operation) {
    console.error(`${operation} failed:`, error.code || error.message);
    return res.status(500).json({ error: `Unable to ${operation}.` });
}

async function loadRecipeDetails(recipes, includeReviews = false) {
    if (!recipes.length) return recipes;

    const recipeIds = recipes.map((recipe) => recipe.recipe_id);
    const placeholders = recipeIds.map(() => '?').join(', ');

    const [ingredients] = await db.execute(
        `SELECT ri.recipe_id, ri.ingredient_id, i.ingredient_name,
                ri.quantity, ri.unit_of_measure
         FROM RECIPE_INGREDIENT ri
         JOIN INGREDIENT i ON i.ingredient_id = ri.ingredient_id
         WHERE ri.recipe_id IN (${placeholders})
         ORDER BY ri.recipe_id, i.ingredient_name`,
        recipeIds,
    );
    const [steps] = await db.execute(
        `SELECT step_id, recipe_id, step_number, instruction
         FROM PREPARATION_STEP
         WHERE recipe_id IN (${placeholders})
         ORDER BY recipe_id, step_number`,
        recipeIds,
    );
    const reviews = includeReviews
        ? (await db.execute(
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

async function findRecipes({ recipeId } = {}) {
    const where = recipeId ? 'WHERE r.recipe_id = ?' : '';
    const params = recipeId ? [recipeId] : [];
    const [recipes] = await db.execute(
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
