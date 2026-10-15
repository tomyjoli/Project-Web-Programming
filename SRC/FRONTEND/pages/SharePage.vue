<template>
    <section class="detail-page share-page">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Your creations</p>
          <h1>Shared recipes</h1>
          <p class="section-copy">A catalogue of the cocktails you have created.</p>
        </div>
        <button class="create-button" type="button" @click="openCreatePage">Create a recipe <span aria-hidden="true">+</span></button>
      </div>
      <div v-if="ownedRecipes.length" class="recipe-list">
        <div
          v-for="recipe in ownedRecipes"
          :key="recipe.recipe_id"
          class="recipe-list-item"
        >
          <a
            class="recipe-row"
            :href="ownedRecipeHref(recipe)"
            @click.prevent="openOwnedRecipe(recipe)"
          >
            <img v-if="recipe.image" class="recipe-row-image" :src="recipe.image" :alt="recipe.title" />
            <div v-else class="recipe-row-image recipe-image-placeholder" aria-hidden="true">🍸</div>
            <div class="recipe-row-copy">
              <div class="recipe-meta"><span>Your recipe</span><span>{{ recipe.difficulty }}</span></div>
              <h3>{{ recipe.title }}</h3>
              <p>{{ recipe.description }}</p>
              <div class="recipe-tags">
                <span v-for="ingredient in recipe.ingredients" :key="ingredient.name">{{ ingredient.name }}</span>
              </div>
            </div>
            <span class="row-arrow" aria-hidden="true">→</span>
          </a>
          <button
            class="favorite-button"
            :class="{ 'is-favorite': isFavorite(recipe) }"
            type="button"
            :aria-label="isFavorite(recipe) ? `Remove ${recipe.title} from favorites` : `Add ${recipe.title} to favorites`"
            :aria-pressed="isFavorite(recipe)"
            @click="toggleFavorite(recipe)"
          ><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" /></svg></button>
        </div>
      </div>
      <p v-else class="no-owned-recipes">There is no recipes here for the moment</p>
    </section>
</template>

<script setup>
import { inject } from 'vue'
const { ownedRecipes, ownedRecipeHref, openOwnedRecipe, isFavorite, toggleFavorite, openCreatePage } = inject('page-context')
</script>
