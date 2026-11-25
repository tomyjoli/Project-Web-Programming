function positiveInteger(value) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function validateRecipe(body) {
  const recipe = body && typeof body === 'object' ? body : {};
  const errors = [];
  const requiredText = ['title', 'category', 'glass_name'];

  for (const field of requiredText) {
    if (typeof recipe[field] !== 'string' || !recipe[field].trim()) {
      errors.push(`${field} is required.`);
    }
  }

  if (typeof recipe.title === 'string' && recipe.title.trim().length > 100) {
    errors.push('title must be 100 characters or fewer.');
  }
  if (typeof recipe.description === 'string' && recipe.description.length > 65535) {
    errors.push('description must be 65,535 characters or fewer.');
  }
  if (typeof recipe.category === 'string' && recipe.category.trim().length > 100) {
    errors.push('category must be 100 characters or fewer.');
  }
  if (typeof recipe.glass_name === 'string' && recipe.glass_name.trim().length > 50) {
    errors.push('glass_name must be 50 characters or fewer.');
  }
  if (recipe.description != null && typeof recipe.description !== 'string') {
    errors.push('description must be text.');
  }
  if (recipe.photo_url != null && typeof recipe.photo_url !== 'string') {
    errors.push('photo_url must be text.');
  }
  if (recipe.photo_url && recipe.photo_url.length > 255) {
    errors.push('photo_url must be 255 characters or fewer.');
  }
  if (recipe.photo_url) {
    const localAssetPath = /^src\/assets\/[A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+)+$/.test(recipe.photo_url);
    if (!localAssetPath) {
      try {
        const photoUrl = new URL(recipe.photo_url);
        if (!['http:', 'https:'].includes(photoUrl.protocol)) {
          errors.push('photo_url must use HTTP or HTTPS.');
        }
      } catch {
        errors.push('photo_url must be a valid HTTP or HTTPS URL.');
      }
    }
  }
  if (recipe.preparation_time != null
      && (!Number.isInteger(Number(recipe.preparation_time))
        || Number(recipe.preparation_time) < 1
        || Number(recipe.preparation_time) > 2147483647)) {
    errors.push('preparation_time must be a positive number of seconds.');
  }
  if (!positiveInteger(recipe.capacity_cl) || Number(recipe.capacity_cl) > 2147483647) {
    errors.push('capacity_cl must be a positive integer.');
  }
  if (!Array.isArray(recipe.recipe_ingredients) || recipe.recipe_ingredients.length === 0) {
    errors.push('At least one ingredient is required.');
  } else if (recipe.recipe_ingredients.length > 50) {
    errors.push('A recipe cannot have more than 50 ingredients.');
  } else {
    const ingredientIds = new Set();
    for (const ingredient of recipe.recipe_ingredients) {
      const ingredientId = positiveInteger(ingredient?.ingredient_id);
      if (!ingredientId || ingredientIds.has(ingredientId)) {
        errors.push('Ingredients must have unique, valid ingredient_id values.');
        break;
      }
      ingredientIds.add(ingredientId);
      if (!Number.isFinite(Number(ingredient.quantity))
          || Number(ingredient.quantity) <= 0
          || Number(ingredient.quantity) > 999.99
          || Math.round(Number(ingredient.quantity) * 100) !== Number(ingredient.quantity) * 100) {
        errors.push('Ingredient quantities must be between 0 and 999.99.');
        break;
      }
      if (typeof ingredient.unit_of_measure !== 'string'
          || !ingredient.unit_of_measure.trim()
          || ingredient.unit_of_measure.trim().length > 20) {
        errors.push('Each ingredient needs a unit of 20 characters or fewer.');
        break;
      }
    }
  }
  if (!Array.isArray(recipe.preparation_steps) || recipe.preparation_steps.length === 0
      || recipe.preparation_steps.length > 50
      || recipe.preparation_steps.some((step) => (
        typeof step?.instruction !== 'string'
        || !step.instruction.trim()
        || step.instruction.trim().length > 2000
      ))) {
    errors.push('At least one non-empty preparation step is required.');
  }

  return errors;
}

module.exports = { positiveInteger, validateRecipe };
