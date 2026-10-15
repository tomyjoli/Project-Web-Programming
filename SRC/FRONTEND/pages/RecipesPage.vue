<template>
  <template v-if="!currentRecipe">
    <section id="top" class="hero-section">
      <video class="hero-video" autoplay muted loop playsinline aria-hidden="true">
        <source :src="cocktailVideo" type="video/mp4" />
      </video>
      <div class="hero-overlay"></div>
      <div class="hero-copy">
        <p class="eyebrow">Cocktails made personal</p>
        <h1>Good drinks start with a little inspiration.</h1>
        <p class="hero-text">Explore recipes created and rated by the Banana Split community.</p>
        <a class="hero-link" href="#featured">Explore recipes</a>
      </div>
    </section>

    <div class="content-shell">
      <section id="featured" class="page-section featured-section">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Community favorites</p>
            <h2>Recipes worth a toast</h2>
          </div>
          <p class="section-copy">The highest-rated cocktails, picked by the people who made them.</p>
        </div>
        <div class="featured-grid">
          <div v-for="(recipe, index) in featuredRecipes" :key="recipe.recipe_id" class="featured-item">
            <a class="featured-card" :href="recipeHref(recipe)" @click.prevent="$emit('open-recipe', recipe)">
              <div class="featured-image">
                <img v-if="recipe.image" :src="recipe.image" :alt="recipe.title" />
                <div v-else class="recipe-image-placeholder" aria-hidden="true">🍸</div>
                <span class="featured-rank">Top {{ index + 1 }}</span>
              </div>
              <div class="featured-copy">
                <span class="rating-pill">★ {{ recipe.rating }} <span>({{ recipe.ratingCount }})</span></span>
                <h3>{{ recipe.title }}</h3>
                <p>By {{ recipe.author }}</p>
              </div>
            </a>
            <button
              class="favorite-button"
              :class="{ 'is-favorite': isFavorite(recipe) }"
              type="button"
              :aria-label="isFavorite(recipe) ? `Remove ${recipe.title} from favorites` : `Add ${recipe.title} to favorites`"
              :aria-pressed="isFavorite(recipe)"
              @click="$emit('toggle-favorite', recipe)"
            ><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" /></svg></button>
          </div>
        </div>
      </section>

      <section id="filters" class="page-section filters-section">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Find your next pour</p>
            <h2>Search & filter</h2>
          </div>
          <p class="section-copy">Look up a cocktail by name, ingredient or creator.</p>
        </div>
        <div class="filter-controls">
          <label class="search-bar" for="recipe-search">
            <span aria-hidden="true">⌕</span>
            <input
              id="recipe-search"
              type="search"
              :value="searchQuery"
              placeholder="Try vodka, pineapple, Tom..."
              @input="$emit('update:search-query', $event.target.value)"
            />
            <button v-if="searchQuery" type="button" @click="$emit('update:search-query', '')">Clear</button>
          </label>
          <label class="filter-select">
            <span>Ingredient</span>
            <select :value="selectedIngredient" @change="$emit('update:selected-ingredient', $event.target.value)">
              <option value="">All ingredients</option>
              <option v-for="ingredient in allIngredientNames" :key="ingredient" :value="ingredient">{{ ingredient }}</option>
            </select>
          </label>
          <label class="filter-select">
            <span>Sort by</span>
            <select :value="sortMode" @change="$emit('update:sort-mode', $event.target.value)">
              <option value="rating">Highest rated</option>
              <option value="title">Title (A–Z)</option>
            </select>
          </label>
        </div>
      </section>

      <section id="catalog" class="page-section catalog-section">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Made by the community</p>
            <h2>Recipe catalogue</h2>
          </div>
          <span class="recipe-count">{{ filteredRecipes.length }} recipes</span>
        </div>
        <div v-if="filteredRecipes.length" class="recipe-list">
          <div v-for="recipe in filteredRecipes" :key="recipe.recipe_id" class="recipe-list-item">
            <a class="recipe-row" :href="recipeHref(recipe)" @click.prevent="$emit('open-recipe', recipe)">
              <img v-if="recipe.image" class="recipe-row-image" :src="recipe.image" :alt="recipe.title" />
              <div v-else class="recipe-row-image recipe-image-placeholder" aria-hidden="true">🍸</div>
              <div class="recipe-row-copy">
                <div class="recipe-meta"><span>Community recipe</span><span>By {{ recipe.author }}</span></div>
                <h3>{{ recipe.title }}</h3>
                <p>{{ recipe.description }}</p>
                <div class="recipe-tags">
                  <span v-for="ingredient in recipe.ingredients" :key="ingredient.name">{{ ingredient.name }}</span>
                  <span>{{ recipe.preparationTime }}</span>
                </div>
              </div>
              <div class="recipe-row-rating">
                <strong>★ {{ recipe.rating }}</strong>
                <span>{{ recipe.ratingCount }} reviews</span>
              </div>
              <span class="row-arrow" aria-hidden="true">→</span>
            </a>
            <button
              class="favorite-button"
              :class="{ 'is-favorite': isFavorite(recipe) }"
              type="button"
              :aria-label="isFavorite(recipe) ? `Remove ${recipe.title} from favorites` : `Add ${recipe.title} to favorites`"
              :aria-pressed="isFavorite(recipe)"
              @click="$emit('toggle-favorite', recipe)"
            ><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" /></svg></button>
          </div>
        </div>
        <p v-else class="empty-state">No recipes match those filters. Try another search.</p>
      </section>

      <section id="share" class="share-section">
        <div>
          <p class="eyebrow">Your turn</p>
          <h2>Want to share your creation?</h2>
          <p>Have a cocktail recipe of your own? We would love to see it.</p>
        </div>
        <a class="create-button" href="#/share/create" @click.prevent="$emit('create-recipe')">Create a recipe <span aria-hidden="true">→</span></a>
      </section>
    </div>
  </template>
</template>

<script setup>
defineProps({
  cocktailVideo: { type: String, required: true },
  featuredRecipes: { type: Array, required: true },
  searchQuery: { type: String, required: true },
  selectedIngredient: { type: String, required: true },
  allIngredientNames: { type: Array, required: true },
  sortMode: { type: String, required: true },
  filteredRecipes: { type: Array, required: true },
  currentRecipe: { type: Object, default: null },
  isFavorite: { type: Function, required: true },
  recipeHref: { type: Function, required: true },
})

defineEmits([
  'open-recipe',
  'toggle-favorite',
  'create-recipe',
  'update:search-query',
  'update:selected-ingredient',
  'update:sort-mode',
])
</script>
