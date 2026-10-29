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
    .map((entry) => ingredients.find((ingredient) => ingredient.ingredient_id === entry.ingredient_id))
  const reviews = recipeData.reviews.filter((review) => review.recipe_id === recipe.recipe_id)
  const averageRating = reviews.length
    ? reviews.reduce((total, review) => total + review.rating, 0) / reviews.length
    : null

  return {
    ...recipe,
    creator: creator.username,
    ingredients: recipeIngredients,
    image: recipeImages[recipe.recipe_id],
    averageRating,
    reviewCount: reviews.length,
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
</script>

<template>
  <main class="recipes-page">
    <section class="recipes-introduction">
      <h1>Find your next favorite cocktail</h1>
      <p>Search recipes by name, creator, or ingredients you already have.</p>
    </section>

    <section class="recipe-search" aria-label="Search and filter recipes">
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

    <section class="recipe-results" aria-live="polite">
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
  margin: 0 0 12px;
  font-size: 36px;
}

.recipes-introduction p {
  margin: 0;
  color: var(--nav-text);
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
  border-radius: 10px;
  background-color: var(--surface);
  box-shadow: var(--header-shadow);
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
</style>
