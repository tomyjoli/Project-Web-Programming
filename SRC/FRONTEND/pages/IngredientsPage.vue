<template>
  <section class="detail-page ingredients-page">
    <div class="section-heading">
      <div>
        <p class="eyebrow">Explore the bar</p>
        <h1>Ingredients</h1>
        <p class="section-copy">Browse ingredients from the Banana Split recipe data.</p>
      </div>
      <span class="recipe-count">{{ filteredIngredients.length }} ingredients</span>
    </div>
    <label class="search-bar ingredients-search" for="ingredient-search">
      <span aria-hidden="true">⌕</span>
      <input
        id="ingredient-search"
        type="search"
        placeholder="Search by name, category or allergen..."
        :value="ingredientSearchQuery"
        @input="$emit('update:ingredient-search-query', $event.target.value)"
      />
      <button v-if="ingredientSearchQuery" type="button" @click="$emit('update:ingredient-search-query', '')">Clear</button>
    </label>
    <div v-if="filteredIngredients.length" class="ingredients-grid">
      <article
        v-for="ingredient in filteredIngredients"
        :key="ingredient.ingredient_id"
        class="ingredient-card"
      >
        <div class="ingredient-card-heading">
          <h2>{{ ingredient.ingredient_name }}</h2>
          <span>{{ ingredient.category_name || 'Uncategorized' }}</span>
        </div>
        <dl class="ingredient-card-details">
          <div>
            <dt>Alcohol</dt>
            <dd>{{ ingredient.alcohol_degree ?? 0 }}%</dd>
          </div>
          <div>
            <dt>Average price</dt>
            <dd>{{ ingredient.average_price == null ? 'Not provided' : `${Number(ingredient.average_price).toFixed(2)} €` }}</dd>
          </div>
          <div>
            <dt>Allergens</dt>
            <dd>{{ ingredient.allergens || 'None listed' }}</dd>
          </div>
          <div>
            <dt>Legal</dt>
            <dd>{{ ingredient.is_legal ? 'Yes' : 'No' }}</dd>
          </div>
        </dl>
      </article>
    </div>
    <p v-else class="empty-state">No ingredients match your search. Try another name or category.</p>
  </section>
</template>

<script setup>
defineProps({
  filteredIngredients: { type: Array, required: true },
  ingredientSearchQuery: { type: String, required: true },
})

defineEmits(['update:ingredient-search-query'])
</script>
