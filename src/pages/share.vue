<script setup>
import { computed, ref, watch } from 'vue'
import recipeData from '../data/bananasplit.json'

let nextRowId = 1

const form = ref({
  title: '',
  category: '',
  description: '',
  photo_url: '',
  preparation_time: '',
  glass_name: '',
  capacity_cl: '',
})
const ingredients = ref([createIngredient()])
const steps = ref([createStep()])
const recipePayload = ref(null)
const previewIngredients = computed(() => ingredients.value
  .filter((ingredient) => ingredient.ingredient_id)
  .map((ingredient) => recipeData.ingredients.find(
    (item) => item.ingredient_id === Number(ingredient.ingredient_id),
  ))
  .filter(Boolean))
const previewPreparationTime = computed(() => (
  form.value.preparation_time ? Math.ceil(Number(form.value.preparation_time) / 60) : null
))

function createIngredient() {
  return { id: nextRowId++, ingredient_id: '', quantity: '', unit_of_measure: '' }
}

function createStep() {
  return { id: nextRowId++, instruction: '' }
}

function addIngredient() {
  ingredients.value.push(createIngredient())
}

function removeIngredient(index) {
  ingredients.value.splice(index, 1)
}

function addStep() {
  steps.value.push(createStep())
}

function removeStep(index) {
  steps.value.splice(index, 1)
}

function prepareRecipe() {
  recipePayload.value = {
    recipe: {
      title: form.value.title,
      category: form.value.category,
      description: form.value.description || null,
      photo_url: form.value.photo_url || null,
      preparation_time: form.value.preparation_time
        ? Number(form.value.preparation_time)
        : null,
      glass_name: form.value.glass_name,
      capacity_cl: Number(form.value.capacity_cl),
    },
    recipe_ingredients: ingredients.value.map((ingredient) => ({
      ingredient_id: Number(ingredient.ingredient_id),
      quantity: Number(ingredient.quantity),
      unit_of_measure: ingredient.unit_of_measure,
    })),
    preparation_steps: steps.value.map((step, index) => ({
      step_number: index + 1,
      instruction: step.instruction,
    })),
  }
}

watch([form, ingredients, steps], () => {
  recipePayload.value = null
}, { deep: true })
</script>

<template>
  <main class="share-page">
    <section class="share-introduction">
      <h1>Share your recipe</h1>
      <p>Have a cocktail worth sharing? Add its details below.</p>
    </section>

    <form class="share-form" @submit.prevent="prepareRecipe">
      <section class="form-section recipe-details-section">
        <h2>Recipe details</h2>

        <div class="recipe-details-layout">
          <section class="recipe-preview">
            <h3>Recipe preview</h3>
            <p class="preview-description">This is how others users will see your recipe.</p>

            <div class="recipe-grid">
              <article class="recipe-card">
                <img
                  v-if="form.photo_url"
                  class="recipe-image"
                  :src="form.photo_url"
                  :alt="form.title || 'Recipe photo'"
                >
                <div v-else class="recipe-image-placeholder">Recipe photo</div>

                <div class="recipe-card-content">
                  <p class="recipe-creator">By you</p>
                  <h3>{{ form.title || 'Recipe name' }}</h3>
                  <p class="recipe-description">
                    {{ form.description || 'Your recipe description will appear here.' }}
                  </p>
                  <p class="recipe-rating">No reviews yet</p>
                  <p v-if="previewPreparationTime" class="recipe-time">
                    {{ previewPreparationTime }} min
                  </p>
                  <ul v-if="previewIngredients.length" class="ingredient-list" aria-label="Ingredients">
                    <li v-for="ingredient in previewIngredients" :key="ingredient.ingredient_id">
                      {{ ingredient.ingredient_name }}
                    </li>
                  </ul>
                </div>
              </article>
            </div>
          </section>

          <div class="recipe-fields">
            <label class="form-field">
              <span>Recipe name</span>
              <input v-model.trim="form.title" type="text" maxlength="100" placeholder="e.g. Summer Berry Cooler" required>
            </label>

            <div class="form-row">
              <label class="form-field">
                <span>Category</span>
                <input v-model.trim="form.category" type="text" maxlength="100" placeholder="e.g. Cocktail, Milkshake" required>
              </label>

              <label class="form-field">
                <span>Preparation time (seconds)</span>
                <input v-model="form.preparation_time" type="number" min="1" step="1" placeholder="300">
              </label>
            </div>

            <label class="form-field">
              <span>Description</span>
              <textarea v-model.trim="form.description" rows="3" placeholder="Describe your recipe"></textarea>
            </label>

            <label class="form-field">
              <span>Photo URL</span>
              <input v-model.trim="form.photo_url" type="url" maxlength="255" placeholder="https://example.com/your-recipe.jpg">
            </label>

            <div class="form-row">
              <label class="form-field">
                <span>Glass name</span>
                <input v-model.trim="form.glass_name" type="text" maxlength="50" placeholder="e.g. Highball" required>
              </label>

              <label class="form-field">
                <span>Glass capacity (cl)</span>
                <input v-model="form.capacity_cl" type="number" min="1" step="1" placeholder="30" required>
              </label>
            </div>
          </div>
        </div>
      </section>

      <section class="form-section">
        <h2>Ingredients</h2>

        <div v-for="(ingredient, index) in ingredients" :key="ingredient.id" class="ingredient-row">
          <label class="form-field">
            <span>Ingredient</span>
            <select v-model="ingredient.ingredient_id" required>
              <option value="" disabled>Select an ingredient</option>
              <option
                v-for="item in recipeData.ingredients"
                :key="item.ingredient_id"
                :value="item.ingredient_id"
                :disabled="ingredients.some((row, rowIndex) => rowIndex !== index && row.ingredient_id === item.ingredient_id)"
              >
                {{ item.ingredient_name }}
              </option>
            </select>
          </label>

          <label class="form-field">
            <span>Quantity</span>
            <input v-model="ingredient.quantity" type="number" min="0.01" max="999.99" step="0.01" placeholder="4" required>
          </label>

          <label class="form-field">
            <span>Unit</span>
            <input v-model.trim="ingredient.unit_of_measure" type="text" maxlength="20" placeholder="cl" required>
          </label>

          <button class="remove-button" type="button" :disabled="ingredients.length === 1" @click="removeIngredient(index)">
            Remove
          </button>
        </div>

        <button class="secondary-button" type="button" @click="addIngredient">+ Add ingredient</button>
      </section>

      <section class="form-section">
        <h2>Preparation</h2>

        <div v-for="(step, index) in steps" :key="step.id" class="step-row">
          <label class="form-field">
            <span>Step {{ index + 1 }}</span>
            <textarea v-model.trim="step.instruction" rows="3" placeholder="Describe this step" required></textarea>
          </label>

          <button class="remove-button" type="button" :disabled="steps.length === 1" @click="removeStep(index)">
            Remove
          </button>
        </div>

        <button class="secondary-button" type="button" @click="addStep">+ Add step</button>
      </section>

      <button class="share-button" type="submit">Share recipe</button>
    </form>

    <section v-if="recipePayload" class="payload-section" aria-live="polite">
      <h2>Recipe data</h2>
      <p>The authenticated user ID will be added when the database API is connected.</p>
      <pre>{{ JSON.stringify(recipePayload, null, 2) }}</pre>
    </section>
  </main>
</template>

<style scoped>
.share-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 48px 6%;
  color: var(--text);
}

.share-introduction {
  margin-bottom: 32px;
  text-align: center;
}

.share-introduction h1 {
  margin: 0 0 16px;
  font-family: "Press Start 2P", "Terminal", "Courier New", monospace;
  font-size: clamp(22px, 4vw, 36px);
  font-weight: 900;
  letter-spacing: 0.04em;
  line-height: 1.5;
  text-shadow: 3px 3px 0 var(--button);
}

.share-introduction h1::before {
  display: block;
  margin-bottom: 8px;
  font-family: sans-serif;
  font-size: 32px;
  letter-spacing: normal;
  text-shadow: none;
}

.share-introduction p,
.payload-section p {
  margin: 0;
  color: var(--nav-text);
}

.share-introduction p {
  font-size: 16px;
  line-height: 1.5;
}

.recipe-image-placeholder {
  display: grid;
  place-items: center;
}

.share-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-section,
.payload-section {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 24px;
  border-radius: 10px;
  background-color: var(--surface);
  box-shadow: var(--header-shadow);
}

.form-section h2,
.payload-section h2 {
  margin: 0;
  color: var(--button);
  font-size: 22px;
}

.form-row,
.ingredient-row,
.step-row {
  display: flex;
  align-items: flex-end;
  gap: 16px;
}

.form-field {
  padding-top: 20px;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 8px;
}

.form-field span {
  font-weight: 600;
}

.form-field input,
.form-field select,
.form-field textarea {
  box-sizing: border-box;
  width: 100%;
  padding: 11px 12px;
  border: 1px solid var(--nav-text);
  border-radius: 6px;
  background-color: var(--page-bg);
  color: var(--text);
  font: inherit;
}

.recipe-details-layout {
  display: grid;
  grid-template-columns: minmax(0, 320px) minmax(0, 1fr);
  align-items: start;
  gap: 24px;
}

.recipe-preview {
  min-width: 0;
}

.recipe-preview h3 {
  margin: 0 0 8px;
  color: var(--button);
  font-size: 18px;
}

.preview-description {
  margin: 0 0 12px;
  color: var(--nav-text);
}

.recipe-card {
  overflow: hidden;
  border-radius: 10px;
  background-color: var(--surface);
  box-shadow: var(--header-shadow);
}

.recipe-image,
.recipe-image-placeholder {
  display: grid;
  width: 100%;
  height: 220px;
  object-fit: cover;
  place-items: center;
  background-color: var(--page-bg);
  color: var(--nav-text);
}

.recipe-card-content {
  padding: 20px;
}

.recipe-creator,
.recipe-time {
  color: var(--button);
  font-size: 14px;
  font-weight: 600;
}

.recipe-creator {
  margin: 0 0 8px;
}

.recipe-card h3 {
  margin: 0 0 10px;
}

.recipe-description {
  min-height: 48px;
  margin: 0 0 14px;
  color: var(--nav-text);
}

.recipe-time {
  margin: 0 0 12px;
}

.recipe-rating {
  margin: 0 0 12px;
  color: var(--nav-text);
  font-size: 14px;
}

.ingredient-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.ingredient-list li {
  padding: 6px 10px;
  border-radius: 16px;
  background-color: var(--button);
  color: #ffffff;
  font-size: 12px;
}

.secondary-button,
.remove-button,
.share-button {
  padding: 11px 18px;
  border: 1px solid var(--button);
  border-radius: 6px;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.secondary-button,
.remove-button {
  margin-top: 80px;
  align-self: flex-start;
  background-color: transparent;
  color: var(--button);
}

.share-button {
  align-self: flex-start;
  background-color: var(--button);
  color: #ffffff;
}

.secondary-button:hover,
.remove-button:hover:not(:disabled),
.share-button:hover {
  border-color: var(--button-hover);
  background-color: var(--button-hover);
  color: var(--text);
}

.remove-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.payload-section {
  margin-top: 24px;
}

.payload-section pre {
  overflow-x: auto;
  margin: 0;
  padding: 16px;
  border-radius: 6px;
  background-color: var(--page-bg);
}

@media (max-width: 640px) {
  .recipe-details-layout {
    grid-template-columns: 1fr;
  }

  .form-row,
  .ingredient-row,
  .step-row {
    flex-direction: column;
    align-items: stretch;
  }
}

</style>