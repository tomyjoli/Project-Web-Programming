<template>
    <section class="detail-page">
      <template v-if="ownedRecipe">
        <a class="back-link" href="#/share" @click.prevent="openSharePage">← Back to your recipes</a>
        <article class="recipe-detail">
          <div class="detail-heading detail-heading-with-favorite">
            <div>
              <p class="eyebrow">Your recipe · {{ ownedRecipe.difficulty }}</p>
              <h1>{{ ownedRecipe.title }}</h1>
              <p class="detail-description">{{ ownedRecipe.description }}</p>
            </div>
            <button
              class="favorite-button"
              :class="{ 'is-favorite': isFavorite(ownedRecipe) }"
              type="button"
              :aria-label="isFavorite(ownedRecipe) ? `Remove ${ownedRecipe.title} from favorites` : `Add ${ownedRecipe.title} to favorites`"
              :aria-pressed="isFavorite(ownedRecipe)"
              @click="toggleFavorite(ownedRecipe)"
            ><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" /></svg></button>
          </div>
          <div class="detail-hero">
            <img v-if="ownedRecipe.image" class="detail-image" :src="ownedRecipe.image" :alt="ownedRecipe.title" />
            <div v-else class="detail-image recipe-image-placeholder" aria-hidden="true">🍸</div>
            <div class="detail-stats">
              <span><small>DIFFICULTY</small>{{ ownedRecipe.difficulty }}</span>
              <span><small>INGREDIENTS</small>{{ ownedRecipe.ingredients.length }} items</span>
              <span><small>PREPARATION STEPS</small>{{ ownedRecipe.steps.length }} steps</span>
            </div>
          </div>
          <div class="owned-recipe-actions">
            <button class="create-button" type="button" @click="openEditPage(ownedRecipe)">Edit recipe</button>
            <button class="delete-button" type="button" @click="deleteOwnedRecipe(ownedRecipe)">Delete recipe</button>
          </div>
          <p v-if="formError" class="form-error" role="alert">{{ formError }}</p>
        </article>
        <div class="detail-columns">
          <section class="detail-panel">
            <p class="eyebrow">What you need</p>
            <h2>Ingredients</h2>
            <ul class="ingredient-list">
              <li v-for="ingredient in ownedRecipe.ingredients" :key="ingredient.id">
                <span>{{ ingredient.name }}</span>
                <strong>{{ ingredient.quantity }} {{ ingredient.unit }}</strong>
              </li>
            </ul>
          </section>
          <section class="detail-panel">
            <p class="eyebrow">Take it step by step</p>
            <h2>How to make it</h2>
            <ol class="step-list">
              <li v-for="step in ownedRecipe.steps" :key="step.id">
                <span class="step-number">{{ step.step_number }}</span>
                <p>{{ step.instruction }}</p>
              </li>
            </ol>
          </section>
        </div>
      </template>
      <div v-else class="not-found">
        <h1>Recipe not found</h1>
        <a class="create-button" href="#/share" @click.prevent="openSharePage">Back to your recipes</a>
      </div>
    </section>
</template>

<script setup>
import { inject } from 'vue'
const { ownedRecipe, openSharePage, isFavorite, toggleFavorite, openEditPage, deleteOwnedRecipe, formError } = inject('page-context')
</script>
