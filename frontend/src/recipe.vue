<script setup>
import { computed, onMounted, ref } from 'vue'
import { apiGet } from './api.js'
import pineappleVodkaImage from '../assets/pineapple_vodka.jpg'
import rumSunriseImage from '../assets/rum_sunrise.jpg'
import limeGrenadineFizzImage from '../assets/lime_grenadine_fizz.jpg'
import tropicalRumCoolerImage from '../assets/Tropical_Rum_Cooler.jpg'
import fiveIngredientPunchImage from '../assets/Five_Ingredient_Punch.jpg'
import milkshakeImage from '../assets/milkshake_ffm.jpg'
import mojitoImage from '../assets/mojito.jpg'
import cappuccinoImage from '../assets/cappuccino.jpg'

const searchText = ref('')
const selectedIngredient = ref('')
const maximumPreparationTime = ref('')
const expandedSections = ref({})
const selectedRecipeId = ref(null)
const recipes = ref([])
const ingredients = ref([])
const loading = ref(true)
const detailLoading = ref(false)
const error = ref('')
const selectedRecipe = computed(() => (
  recipes.value.find((recipe) => recipe.recipe_id === selectedRecipeId.value) ?? null
))

const recipeImages = {
  1: pineappleVodkaImage,
  2: rumSunriseImage,
  3: limeGrenadineFizzImage,
  4: tropicalRumCoolerImage,
  5: fiveIngredientPunchImage,
  6: milkshakeImage,
  7: milkshakeImage,
  8: milkshakeImage,
  9: mojitoImage,
  10: cappuccinoImage,
}

onMounted(loadRecipes)

async function loadRecipes() {
  loading.value = true
  error.value = ''

  try {
    const [recipeResults, ingredientResults] = await Promise.all([
      apiGet('/recipesapi/recipes'),
      apiGet('/recipesapi/ingredients'),
    ])
    recipes.value = recipeResults.map(normalizeRecipe)
    ingredients.value = ingredientResults
  } catch (requestError) {
    error.value = requestError.message
  } finally {
    loading.value = false
  }
}

function normalizeRecipe(recipe) {
  const photoUrl = recipe.photo_url

  return {
    ...recipe,
    image: photoUrl?.startsWith('http') && !photoUrl.includes('example.com')
      ? photoUrl
      : recipeImages[recipe.recipe_id] || '',
    averageRating: recipe.averageRating == null ? null : Number(recipe.averageRating),
    reviewCount: Number(recipe.reviewCount || 0),
    ingredients: recipe.ingredients || [],
    preparationSteps: recipe.preparationSteps || [],
    reviews: recipe.reviews || [],
  }
}

const filteredRecipes = computed(() => {
  const search = searchText.value.trim().toLowerCase()

  return recipes.value.filter((recipe) => {
    const matchesSearch = `${recipe.title} ${recipe.creator}`.toLowerCase().includes(search)
    const matchesIngredient = !selectedIngredient.value
      || recipe.ingredients.some((ingredient) => ingredient.ingredient_id === Number(selectedIngredient.value))
    const matchesPreparationTime = !maximumPreparationTime.value
      || recipe.preparation_time <= Number(maximumPreparationTime.value) * 60

    return matchesSearch && matchesIngredient && matchesPreparationTime
  })
})

const hasActiveFilters = computed(() => (
  searchText.value.trim() !== ''
  || selectedIngredient.value !== ''
  || maximumPreparationTime.value !== ''
))

const recipeSections = computed(() => {
  const topRatedRecipes = filteredRecipes.value
    .filter((recipe) => recipe.reviewCount > 0)
    .sort((first, second) => (
      second.averageRating - first.averageRating
      || second.reviewCount - first.reviewCount
      || first.title.localeCompare(second.title)
    ))

  const categories = [...new Set(filteredRecipes.value.map((recipe) => recipe.category))]
    .sort((first, second) => first.localeCompare(second))
    .map((category) => ({
      id: `category-${category.toLowerCase().replaceAll(' ', '-')}`,
      title: category,
      recipes: filteredRecipes.value.filter((recipe) => recipe.category === category),
    }))

  return [
    { id: 'top-rated', title: 'Top rated', recipes: topRatedRecipes },
    ...categories,
  ].filter((section) => section.recipes.length > 0)
})

function toggleSection(sectionId) {
  expandedSections.value[sectionId] = !expandedSections.value[sectionId]
}

function openRecipe(recipe) {
  selectedRecipeId.value = recipe.recipe_id
  detailLoading.value = true
  error.value = ''
  apiGet(`/recipesapi/recipes/${recipe.recipe_id}`)
    .then((result) => {
      recipes.value = recipes.value.map((item) => (
        item.recipe_id === recipe.recipe_id ? normalizeRecipe(result) : item
      ))
    })
    .catch((requestError) => {
      error.value = requestError.message
    })
    .finally(() => {
      detailLoading.value = false
    })
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function closeRecipe() {
  selectedRecipeId.value = null
  error.value = ''
}
</script>

<template>
  <main class="recipes-page">
    <p v-if="loading" class="request-message" role="status">Loading recipes from the database…</p>
    <p v-if="error" class="request-message request-error" role="alert">{{ error }}</p>

    <section v-if="!selectedRecipe" class="recipes-introduction">
      <h1>Find your next favorite cocktail</h1>
      <p>Search recipes by name, creator, or ingredients you already have.</p>
    </section>

    <section v-if="!selectedRecipe" class="recipe-search" aria-label="Search and filter recipes">
      <label class="search-field">
        <span>Search recipes</span>
        <input
          v-model="searchText"
          type="search"
          placeholder="Recipe or creator ..."
        >
      </label>

      <label class="filter-field">
        <span>Ingredient</span>
        <select v-model="selectedIngredient">
          <option value="">All ingredients</option>
          <option
            v-for="ingredient in ingredients"
            :key="ingredient.ingredient_id"
            :value="ingredient.ingredient_id"
          >
            {{ ingredient.ingredient_name }}
          </option>
        </select>
      </label>

      <label class="filter-field">
        <span>Preparation time</span>
        <select v-model="maximumPreparationTime">
          <option value="">Any time</option>
          <option value="5">Up to 5 minutes</option>
          <option value="10">Up to 10 minutes</option>
          <option value="15">Up to 15 minutes</option>
        </select>
      </label>
    </section>

    <section v-if="!selectedRecipe && !loading && !error" class="recipe-results" aria-live="polite">
      <p class="results-count">
        {{ filteredRecipes.length }}
        {{ filteredRecipes.length === 1 ? 'recipe' : 'recipes' }}
        {{ hasActiveFilters ? 'found' : 'active on the site' }}
      </p>

      <div v-if="recipeSections.length" class="recipe-sections">
        <section
          v-for="section in recipeSections"
          :key="section.id"
          class="recipe-section"
        >
          <div class="recipe-section-heading">
            <h2>{{ section.title }}</h2>
            <button
              v-if="section.recipes.length > 10"
              class="show-more-button"
              type="button"
              @click="toggleSection(section.id)"
            >
              {{ expandedSections[section.id] ? 'Show less' : 'Show more →' }}
            </button>
          </div>

          <div class="recipe-grid">
            <article
              v-for="recipe in (expandedSections[section.id] ? section.recipes : section.recipes.slice(0, 10))"
              :key="recipe.recipe_id"
              class="recipe-card"
              role="button"
              tabindex="0"
              :aria-label="`View recipe: ${recipe.title}`"
              @click="openRecipe(recipe)"
              @keydown.enter="openRecipe(recipe)"
              @keydown.space.prevent="openRecipe(recipe)"
            >
              <img v-if="recipe.image" class="recipe-image" :src="recipe.image" :alt="recipe.title">
              <div v-else class="recipe-image recipe-image-placeholder" aria-hidden="true">
                Recipe photo
              </div>
              <div class="recipe-card-content">
                <p class="recipe-creator">By {{ recipe.creator }}</p>
                <h3>{{ recipe.title }}</h3>
                <p class="recipe-description">{{ recipe.description }}</p>
                <p class="recipe-rating">
                  <template v-if="recipe.reviewCount">
                    <span class="rating-stars" aria-hidden="true">★</span>
                    {{ recipe.averageRating.toFixed(1) }} ·
                    {{ recipe.reviewCount }} {{ recipe.reviewCount === 1 ? 'review' : 'reviews' }}
                  </template>
                  <template v-else>No reviews yet</template>
                </p>
                <p v-if="recipe.preparation_time" class="recipe-time">
                  {{ Math.ceil(recipe.preparation_time / 60) }} min
                </p>
                <ul class="ingredient-list" aria-label="Ingredients">
                  <li
                    v-for="ingredient in recipe.ingredients"
                    :key="ingredient.ingredient_id"
                  >
                    {{ ingredient.ingredient_name }}
                  </li>
                </ul>
              </div>
            </article>
          </div>
        </section>
      </div>

      <p v-else class="no-results">
        No recipes match your search.
      </p>
    </section>

    <article v-if="selectedRecipe" class="recipe-detail">
      <button class="back-button" type="button" @click="closeRecipe">
        <span aria-hidden="true">←</span> Back to recipes
      </button>

      <p v-if="detailLoading" class="request-message" role="status">Loading recipe details…</p>
      <template v-else>
      <section class="detail-overview">
        <img v-if="selectedRecipe.image" class="detail-image" :src="selectedRecipe.image" :alt="selectedRecipe.title">
        <div v-else class="detail-image detail-image-placeholder" aria-hidden="true">Recipe photo</div>
        <div class="detail-summary">
          <p class="recipe-creator">By {{ selectedRecipe.creator }}</p>
          <p class="detail-category">{{ selectedRecipe.category }}</p>
          <h1>{{ selectedRecipe.title }}</h1>
          <p class="detail-description">{{ selectedRecipe.description }}</p>
          <p class="detail-meta">
            <template v-if="selectedRecipe.preparation_time">
              {{ Math.ceil(selectedRecipe.preparation_time / 60) }} min
            </template>
            <template v-else>Time not specified</template>
            <span aria-hidden="true">·</span>
            {{ selectedRecipe.glass_name }}
            <span aria-hidden="true">·</span>
            {{ selectedRecipe.capacity_cl }} cl
          </p>
          <div class="detail-ingredients">
            <h2>Ingredients</h2>
            <ul class="ingredient-list" aria-label="Ingredients">
              <li v-for="ingredient in selectedRecipe.ingredients" :key="ingredient.ingredient_id">
                {{ ingredient.ingredient_name }}
                — {{ ingredient.quantity }} {{ ingredient.unit_of_measure }}
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section class="detail-section" aria-labelledby="preparation-heading">
        <h2 id="preparation-heading">Preparation</h2>
        <ol v-if="selectedRecipe.preparationSteps.length" class="preparation-list">
          <li v-for="step in selectedRecipe.preparationSteps" :key="step.step_id">
            <span class="step-number">{{ step.step_number }}</span>
            <p>{{ step.instruction }}</p>
          </li>
        </ol>
        <p v-else class="empty-detail">
          Preparation steps will be available when this recipe is completed.
        </p>
      </section>

      <section class="detail-section" aria-labelledby="reviews-heading">
        <div class="reviews-heading">
          <h2 id="reviews-heading">Reviews and ratings</h2>
          <span>{{ selectedRecipe.reviewCount }}</span>
        </div>
        <p v-if="selectedRecipe.reviewCount" class="average-rating">
          Average rating: ★ {{ selectedRecipe.averageRating?.toFixed(1) }} / 5
        </p>
        <ul v-if="selectedRecipe.reviews.length" class="review-list">
          <li v-for="review in selectedRecipe.reviews" :key="review.review_id" class="review-card">
            <div class="review-card-heading">
              <h3>{{ review.reviewer }}</h3>
              <span class="review-rating" :aria-label="`${review.rating} out of 5 stars`">
                <span aria-hidden="true">{{ '★'.repeat(review.rating) }}{{ '☆'.repeat(5 - review.rating) }}</span>
                {{ review.rating }}/5
              </span>
            </div>
            <p>{{ review.comment || 'No comment provided.' }}</p>
          </li>
        </ul>
        <p v-else class="empty-detail">
          No reviews have been submitted yet.
        </p>
      </section>
      </template>
    </article>
  </main>
</template>

<style scoped>
.recipes-page {
  padding: 48px 6%;
  background-color: var(--page-bg);
  color: var(--text);
}

.recipes-introduction {
  margin-bottom: 32px;
  text-align: center;
}

.recipes-introduction h1 {
  margin: 0 0 16px;
  font-family: "Press Start 2P", "Terminal", "Courier New", monospace;
  font-size: clamp(22px, 4vw, 36px);
  font-weight: 900;
  letter-spacing: 0.04em;
  line-height: 1.5;
  text-shadow: 3px 3px 0 var(--button);
}

.recipes-introduction h1::before {
  display: block;
  margin-bottom: 8px;
  font-family: sans-serif;
  font-size: 32px;
  letter-spacing: normal;
  text-shadow: none;
}

.recipes-introduction p {
  margin: 0;
  color: var(--nav-text);
  font-size: 16px;
  line-height: 1.5;
}

.recipe-search {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 16px;
  margin-bottom: 32px;
  padding: 20px;
  border-radius: 10px;
  background-color: var(--surface);
  box-shadow: var(--header-shadow);
}

.search-field,
.filter-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-weight: 600;
}

.search-field input,
.filter-field select {
  min-height: 42px;
  padding: 8px 12px;
  border: 1px solid var(--nav-text);
  border-radius: 6px;
  background-color: var(--page-bg);
  color: var(--text);
  font: inherit;
}

.recipe-sections {
  display: flex;
  flex-direction: column;
  gap: 36px;
}

.recipe-section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.recipe-section-heading h2 {
  margin: 0;
}

.show-more-button {
  padding: 8px 0;
  border: 0;
  background: transparent;
  color: var(--button);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.show-more-button:hover {
  color: var(--button-hover);
}

.recipe-grid {
  display: flex;
  gap: 24px;
  overflow-x: auto;
  padding: 4px 4px 16px;
}

.recipe-card {
  flex: 0 0 320px;
  overflow: hidden;
  cursor: pointer;
  border-radius: 10px;
  background-color: var(--surface);
  box-shadow: var(--header-shadow);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.recipe-card:hover,
.recipe-card:focus-visible {
  transform: translateY(-4px);
  box-shadow: 0 8px 22px rgb(0 0 0 / 16%);
  outline: 2px solid var(--button);
  outline-offset: 2px;
}

.recipe-image {
  display: block;
  width: 100%;
  height: 220px;
  object-fit: cover;
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

.rating-stars {
  color: var(--button);
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

.no-results {
  padding: 32px;
  border-radius: 10px;
  background-color: var(--surface);
  text-align: center;
}

.recipe-detail {
  max-width: 1000px;
  margin: 0 auto;
}

.back-button {
  margin: 0 0 24px;
  padding: 10px 0;
  border: 0;
  background: transparent;
  color: var(--button);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.back-button:hover {
  color: var(--button-hover);
}

.detail-overview,
.detail-section {
  overflow: hidden;
  border-radius: 10px;
  background-color: var(--surface);
  box-shadow: var(--header-shadow);
}

.detail-overview {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  margin-bottom: 24px;
}

.detail-image {
  width: 100%;
  height: 100%;
  min-height: 360px;
  object-fit: cover;
}

.detail-summary {
  padding: clamp(24px, 5vw, 40px);
}

.detail-summary h1 {
  margin: 10px 0 16px;
  font-family: "Press Start 2P", "Terminal", "Courier New", monospace;
  font-size: clamp(22px, 3vw, 32px);
  line-height: 1.5;
  text-shadow: 2px 2px 0 var(--button);
}

.detail-category {
  margin: 0;
  color: var(--button);
  font-weight: 700;
}

.detail-description,
.detail-meta {
  color: var(--nav-text);
  line-height: 1.6;
}

.detail-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-weight: 600;
}

.detail-ingredients {
  margin-top: 28px;
}

.detail-ingredients h2,
.detail-section h2 {
  margin: 0 0 18px;
  font-size: 22px;
}

.detail-ingredients .ingredient-list {
  gap: 10px;
}

.detail-section {
  margin-bottom: 24px;
  padding: clamp(24px, 5vw, 36px);
}

.preparation-list,
.review-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.preparation-list li {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.step-number {
  display: grid;
  width: 32px;
  height: 32px;
  flex: 0 0 32px;
  place-items: center;
  border-radius: 50%;
  background-color: var(--button);
  color: #ffffff;
  font-weight: 700;
}

.preparation-list p,
.review-card p {
  margin: 4px 0 0;
  color: var(--nav-text);
  line-height: 1.6;
}

.reviews-heading,
.review-card-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.reviews-heading > span {
  display: grid;
  min-width: 32px;
  height: 32px;
  place-items: center;
  border-radius: 16px;
  background-color: var(--page-bg);
  color: var(--text);
  font-weight: 700;
}

.review-card {
  padding: 18px;
  border-radius: 8px;
  background-color: var(--page-bg);
}

.review-card h3 {
  margin: 0;
}

.review-rating {
  color: var(--nav-text);
  font-size: 14px;
  white-space: nowrap;
}

.review-rating span {
  color: var(--button);
}

.empty-detail {
  margin: 0;
  padding: 20px;
  border-radius: 8px;
  background-color: var(--page-bg);
  color: var(--nav-text);
  line-height: 1.6;
}

.recipe-image-placeholder,
.detail-image-placeholder {
  display: grid;
  place-items: center;
  background-color: var(--page-bg);
  color: var(--nav-text);
}

.average-rating {
  margin: -4px 0 18px;
  color: var(--button);
  font-weight: 700;
}

.request-message {
  margin: 0 0 18px;
  padding: 12px 16px;
  border-radius: 6px;
  background-color: var(--surface);
  color: var(--nav-text);
}

.request-error {
  border: 1px solid #b42318;
  color: #b42318;
}

</style>
