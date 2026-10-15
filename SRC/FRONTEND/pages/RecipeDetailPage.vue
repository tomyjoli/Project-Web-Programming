<template>
  <section class="detail-page">
    <template v-if="currentRecipe">
      <a class="back-link" href="#/" @click.prevent="$emit('back')">← Back to recipes</a>
      <article class="recipe-detail">
        <div class="detail-heading detail-heading-with-favorite">
          <div>
            <p class="eyebrow">Recipe by {{ currentRecipe.author }}</p>
            <h1>{{ currentRecipe.title }}</h1>
            <p class="detail-description">{{ currentRecipe.description }}</p>
          </div>
          <button
            class="favorite-button"
            :class="{ 'is-favorite': isFavorite(currentRecipe) }"
            type="button"
            :aria-label="isFavorite(currentRecipe) ? `Remove ${currentRecipe.title} from favorites` : `Add ${currentRecipe.title} to favorites`"
            :aria-pressed="isFavorite(currentRecipe)"
            @click="$emit('toggle-favorite', currentRecipe)"
          ><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" /></svg></button>
        </div>
        <div class="detail-hero">
          <img v-if="currentRecipe.image" class="detail-image" :src="currentRecipe.image" :alt="currentRecipe.title" />
          <div v-else class="detail-image recipe-image-placeholder" aria-hidden="true">🍸</div>
          <div class="detail-stats">
            <span class="detail-rating">★ {{ currentRecipe.rating }} <small>({{ currentRecipe.ratingCount }} reviews)</small></span>
            <span><small>PREPARATION</small>{{ currentRecipe.preparationTime }}</span>
            <span><small>GLASS</small>{{ currentRecipe.glass_name }} · {{ currentRecipe.capacity_cl }} cl</span>
          </div>
        </div>
      </article>

      <div class="detail-columns">
        <section class="detail-panel">
          <p class="eyebrow">What you need</p>
          <h2>Ingredients</h2>
          <ul class="ingredient-list">
            <li v-for="ingredient in currentRecipe.ingredients" :key="ingredient.name">
              <span>{{ ingredient.name }}</span>
              <strong>{{ ingredient.quantity }} {{ ingredient.unit }}</strong>
            </li>
          </ul>
        </section>
        <section class="detail-panel">
          <p class="eyebrow">Take it step by step</p>
          <h2>How to make it</h2>
          <ol class="step-list">
            <li v-for="step in currentRecipe.steps" :key="step.step_number">
              <span class="step-number">{{ step.step_number }}</span>
              <p>{{ step.instruction }}</p>
            </li>
          </ol>
        </section>
      </div>

      <section class="reviews-section">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Join the conversation</p>
            <h2>Ratings & reviews</h2>
          </div>
          <span class="recipe-count">{{ recipeReviews.length }} reviews</span>
        </div>
        <form class="review-form" @submit.prevent="$emit('submit-review')">
          <label>
            Your rating
            <select v-model.number="reviewDraft.rating" required>
              <option disabled value="">Choose a rating</option>
              <option v-for="rating in 5" :key="rating" :value="rating">{{ rating }} / 5</option>
            </select>
          </label>
          <label class="review-comment">
            Your review
            <textarea v-model.trim="reviewDraft.comment" required rows="3" placeholder="What did you think of this cocktail?"></textarea>
          </label>
          <button class="create-button" type="submit">Post review</button>
          <p v-if="reviewMessage" class="review-message" role="status">{{ reviewMessage }}</p>
        </form>
        <div v-if="recipeReviews.length" class="review-list">
          <article v-for="review in recipeReviews" :key="review.review_id" class="review-card">
            <div class="review-heading">
              <strong>{{ review.author }}</strong>
              <span class="review-stars" :aria-label="`${review.rating} out of 5 stars`">{{ '★'.repeat(Number(review.rating)) }}{{ '☆'.repeat(5 - Number(review.rating)) }}</span>
            </div>
            <p>{{ review.comment }}</p>
          </article>
        </div>
        <p v-else class="empty-state">No reviews yet. Be the first to share your thoughts.</p>
      </section>
    </template>
    <div v-else class="not-found">
      <h1>Recipe not found</h1>
      <p>This recipe may have been removed or the link is incorrect.</p>
      <a class="create-button" href="#/" @click.prevent="$emit('back')">Back to recipes</a>
    </div>
  </section>
</template>

<script setup>
defineProps({
  currentRecipe: { type: Object, default: null },
  recipeReviews: { type: Array, required: true },
  reviewDraft: { type: Object, required: true },
  reviewMessage: { type: String, required: true },
  isFavorite: { type: Function, required: true },
})

defineEmits(['back', 'toggle-favorite', 'submit-review'])
</script>
