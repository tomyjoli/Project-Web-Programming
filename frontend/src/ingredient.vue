<script setup>
import { computed, ref } from 'vue'
import recipeData from '../data/bananasplit.json'

const searchText = ref('')
const selectedCategory = ref('')
const selectedLegality = ref('')

const ingredients = recipeData.ingredients

const categories = [...new Set(ingredients.map((ingredient) => ingredient.category_name))]
  .sort((first, second) => first.localeCompare(second))

const filteredIngredients = computed(() => {
  const search = searchText.value.trim().toLowerCase()

  return ingredients
    .filter((ingredient) => {
      const matchesSearch = [
        ingredient.ingredient_name,
        ingredient.category_name,
        ingredient.allergens || '',
      ].join(' ').toLowerCase().includes(search)
      const matchesCategory = !selectedCategory.value
        || ingredient.category_name === selectedCategory.value
      const matchesLegality = selectedLegality.value === ''
        || ingredient.is_legal === (selectedLegality.value === 'true')

      return matchesSearch && matchesCategory && matchesLegality
    })
    .sort((first, second) => first.ingredient_name.localeCompare(second.ingredient_name))
})
</script>

<template>
  <main class="ingredients-page">
    <section class="ingredients-introduction">
      <h1>Find your ingredients</h1>
      <p>Browse and filter the ingredients available for your recipes.</p>
    </section>

    <section class="ingredient-search" aria-label="Search and filter ingredients">
      <label class="search-field">
        <span>Search ingredients</span>
        <input
          v-model="searchText"
          type="search"
          placeholder="Ingredient, category, or allergen ..."
        >
      </label>

      <label class="filter-field">
        <span>Category</span>
        <select v-model="selectedCategory">
          <option value="">All categories</option>
          <option v-for="category in categories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
      </label>

      <label class="filter-field">
        <span>Legality</span>
        <select v-model="selectedLegality">
          <option value="">All ingredients</option>
          <option value="true">Legal</option>
          <option value="false">Not legal</option>
        </select>
      </label>
    </section>

    <section class="ingredient-results" aria-live="polite">
      <p class="results-count">
        {{ filteredIngredients.length }}
        {{ filteredIngredients.length === 1 ? 'ingredient' : 'ingredients' }}
        {{ searchText || selectedCategory || selectedLegality ? 'found' : 'available' }}
      </p>

      <template v-if="filteredIngredients.length">
        <div class="ingredient-header" aria-hidden="true">
          <span>Ingredient / category</span>
          <span>Alcohol</span>
          <span>Allergens</span>
          <span>Average price (€)</span>
          <span>Legality</span>
        </div>

        <ul class="ingredient-list">
          <li
            v-for="ingredient in filteredIngredients"
            :key="ingredient.ingredient_id"
            class="ingredient-row"
          >
            <div class="ingredient-name">
              <h2>{{ ingredient.ingredient_name }}</h2>
              <p>{{ ingredient.category_name }}</p>
            </div>

            <p v-if="ingredient.alcohol_degree" class="ingredient-detail">
              {{ ingredient.alcohol_degree }}% alcohol
            </p>
            <p v-else class="ingredient-detail">Non-alcoholic</p>

            <p class="ingredient-detail">
              {{ ingredient.allergens ? `Allergen: ${ingredient.allergens}` : 'No listed allergen' }}
            </p>

            <p v-if="ingredient.average_price !== null" class="ingredient-price">
              {{ Number(ingredient.average_price).toFixed(2) }}
            </p>
            <p v-else class="ingredient-detail">Not provided</p>

            <span
              class="legality-status"
              :class="ingredient.is_legal ? 'is-legal' : 'is-not-legal'"
            >
              {{ ingredient.is_legal ? 'Legal' : 'Not legal' }}
            </span>
          </li>
        </ul>
      </template>

      <p v-else class="no-results">
        No ingredients match your search.
      </p>
    </section>
  </main>
</template>

<style scoped>
.ingredients-page {
  padding: 48px 6%;
  background-color: var(--page-bg);
  color: var(--text);
}

.ingredients-introduction {
  margin-bottom: 32px;
  text-align: center;
}

.ingredients-introduction h1 {
  margin: 0 0 16px;
  font-family: "Press Start 2P", "Terminal", "Courier New", monospace;
  font-size: clamp(22px, 4vw, 36px);
  font-weight: 900;
  letter-spacing: 0.04em;
  line-height: 1.5;
  text-shadow: 3px 3px 0 var(--button);
}

.ingredients-introduction h1::before {
  display: block;
  margin-bottom: 8px;
  font-family: sans-serif;
  font-size: 32px;
  letter-spacing: normal;
  text-shadow: none;
}

.ingredients-introduction p {
  margin: 0;
  color: var(--nav-text);
  font-size: 16px;
  line-height: 1.5;
}

.ingredient-search {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
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

.results-count {
  margin: 0 0 12px;
  color: var(--nav-text);
}

.ingredient-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.ingredient-header,
.ingredient-row {
  display: grid;
  grid-template-columns: minmax(150px, 1.5fr) repeat(3, minmax(120px, 1fr)) auto;
  align-items: center;
  gap: 16px;
  padding: 14px 20px;
}

.ingredient-header {
  border-radius: 10px 10px 0 0;
  background-color: var(--button);
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
}

.ingredient-row {
  border-bottom: 1px solid color-mix(in srgb, var(--nav-text) 20%, transparent);
  background-color: var(--surface);
}

.ingredient-row:last-child {
  border-bottom: 0;
  border-radius: 0 0 10px 10px;
}

.ingredient-name h2,
.ingredient-name p,
.ingredient-detail,
.ingredient-price {
  margin: 0;
}

.ingredient-name h2 {
  font-size: 16px;
}

.ingredient-name p,
.ingredient-detail {
  margin-top: 4px;
  color: var(--nav-text);
  font-size: 14px;
}

.ingredient-price {
  font-weight: 600;
  white-space: nowrap;
}

.legality-status {
  justify-self: start;
  padding: 5px 9px;
  border-radius: 14px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.is-legal {
  background-color: var(--button);
  color: #ffffff;
}

.is-not-legal {
  background-color: var(--page-bg);
  color: var(--text);
}

.no-results {
  padding: 32px;
  border-radius: 10px;
  background-color: var(--surface);
  text-align: center;
}

</style>