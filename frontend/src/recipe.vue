<script setup>
import { computed, ref } from 'vue'
import recipeData from '../data/bananasplit.json'
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
const selectedRecipe = computed(() => (
  recipes.find((recipe) => recipe.recipe_id === selectedRecipeId.value) ?? null
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

const ingredients = recipeData.ingredients

const recipes = recipeData.recipes.map((recipe) => {
  const creator = recipeData.users.find((user) => user.user_id === recipe.user_id)
  const recipeIngredients = recipeData.recipe_ingredients
    .filter((entry) => entry.recipe_id === recipe.recipe_id)
    .map((entry) => ({
      ...ingredients.find((ingredient) => ingredient.ingredient_id === entry.ingredient_id),
      quantity: entry.quantity,
      unit_of_measure: entry.unit_of_measure,
    }))
  const reviews = recipeData.reviews.filter((review) => review.recipe_id === recipe.recipe_id)
  const averageRating = reviews.length
    ? reviews.reduce((total, review) => total + review.rating, 0) / reviews.length
    : null
  const preparationSteps = recipeData.preparation_steps
    .filter((step) => step.recipe_id === recipe.recipe_id)
    .sort((first, second) => first.step_number - second.step_number)

  return {
    ...recipe,
    creator: creator.username,
    ingredients: recipeIngredients,
    image: recipeImages[recipe.recipe_id],
    averageRating,
    reviewCount: reviews.length,
    preparationSteps,
    reviews: [],
  }
})

const filteredRecipes = computed(() => {
  const search = searchText.value.trim().toLowerCase()

  return recipes.filter((recipe) => {
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
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function closeRecipe() {
  selectedRecipeId.value = null
}
</script>

<template>
  <main class="recipes-page">
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

    <section v-if="!selectedRecipe" class="recipe-results" aria-live="polite">
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
              <img class="recipe-image" :src="recipe.image" :alt="recipe.title">
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
                <p class="recipe-time">{{ Math.ceil(recipe.preparation_time / 60) }} min</p>
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

    <article v-else class="recipe-detail">
      <button class="back-button" type="button" @click="closeRecipe">
        <span aria-hidden="true">←</span> Back to recipes
      </button>

      <section class="detail-overview">
        <img class="detail-image" :src="selectedRecipe.image" :alt="selectedRecipe.title">
        <div class="detail-summary">
          <p class="recipe-creator">By {{ selectedRecipe.creator }}</p>
          <p class="detail-category">{{ selectedRecipe.category }}</p>
          <h1>{{ selectedRecipe.title }}</h1>
          <p class="detail-description">{{ selectedRecipe.description }}</p>
          <p class="detail-meta">
            {{ Math.ceil(selectedRecipe.preparation_time / 60) }} min
            <span aria-hidden="true">·</span>
            {{ selectedRecipe.glass_name }} glass
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
          <span>{{ selectedRecipe.reviews.length }}</span>
        </div>
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
          No reviews yet. Reviews will be available once the backend is connected.
        </p>
      </section>
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

</style>
