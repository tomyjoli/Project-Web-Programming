<template>
    <section v-if="currentPage === 'album'" class="detail-page album-page">
      <div class="form-page-heading">
        <p class="eyebrow">Your collection</p>
        <h1>Album</h1>
        <p>Your favorite cocktails, all in one place.</p>
      </div>
      <div class="album-toolbar">
        <h2>Your fridges</h2>
        <button class="create-button" type="button" @click="openAlbumCreatePage">Create an album</button>
      </div>
      <div v-if="userAlbums.length" class="fridge-grid">
        <div
          v-for="album in userAlbums"
          :key="album.id"
          class="fridge-card-item"
        >
          <button
            class="fridge-card"
            :class="{ 'is-selected': selectedAlbumId === album.id }"
            type="button"
            :aria-pressed="selectedAlbumId === album.id"
            @click="selectedAlbumId = selectedAlbumId === album.id ? null : album.id"
          >
            <span class="fridge-illustration" :style="{ '--fridge-color': album.color }" aria-hidden="true">
              <span class="fridge-freezer"></span>
              <span class="fridge-handle"></span>
            </span>
            <strong>{{ album.name }}</strong>
            <span>{{ recipesInAlbum(album.id) }} recipes</span>
          </button>
          <button class="delete-album-button" type="button" :aria-label="`Delete album ${album.name}`" @click="deleteAlbum(album)">Delete</button>
        </div>
      </div>
      <p v-if="albumError" class="form-error album-error" role="alert">{{ albumError }}</p>
      <p v-if="!userAlbums.length" class="empty-state album-empty">You haven't created a fridge yet. Create an album to organize your favorite recipes.</p>
      <div class="album-toolbar favorites-toolbar">
        <h2>{{ selectedAlbum ? selectedAlbum.name : 'Favorite recipes' }}</h2>
        <button v-if="selectedAlbumId" class="text-button" type="button" @click="selectedAlbumId = null">Show all favorites</button>
      </div>
      <div v-if="displayedFavoriteRecipes.length" class="recipe-list">
        <div v-for="recipe in displayedFavoriteRecipes" :key="recipe.recipe_id" class="recipe-list-item">
          <a
            class="recipe-row"
            :href="recipe.createdByCurrentUser ? ownedRecipeHref(recipe) : recipeHref(recipe)"
            @click.prevent="recipe.createdByCurrentUser ? openOwnedRecipe(recipe) : openRecipe(recipe)"
          >
            <img v-if="recipe.image" class="recipe-row-image" :src="recipe.image" :alt="recipe.title" />
            <div v-else class="recipe-row-image recipe-image-placeholder" aria-hidden="true">🍸</div>
            <div class="recipe-row-copy">
              <div class="recipe-meta"><span>By {{ recipe.author }}</span><span v-if="recipe.difficulty">{{ recipe.difficulty }}</span></div>
              <h3>{{ recipe.title }}</h3>
              <p>{{ recipe.description }}</p>
            </div>
            <span class="row-arrow" aria-hidden="true">→</span>
          </a>
          <label class="recipe-album-select" @click.stop>
            Add to fridge
            <select :value="albumIdForRecipe(recipe)" @change="assignRecipeToAlbum(recipe, $event)">
              <option value="">No album</option>
              <option v-for="album in userAlbums" :key="album.id" :value="album.id">{{ album.name }}</option>
            </select>
          </label>
          <button
            class="favorite-button is-favorite"
            type="button"
            :aria-label="`Remove ${recipe.title} from favorites`"
            aria-pressed="true"
            @click="toggleFavorite(recipe)"
          ><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" /></svg></button>
        </div>
      </div>
      <p v-else class="empty-state">
        {{ selectedAlbum ? 'This fridge is empty. Show all favorites to add recipes to it.' : 'No favorites yet. Browse the recipes and tap a heart to save one here.' }}
        <button v-if="selectedAlbum" class="text-button" type="button" @click="selectedAlbumId = null">Show all favorites</button>
      </p>
    </section>

    <section v-else-if="currentPage === 'album-create'" class="detail-page album-create-page">
      <a class="back-link" href="#/album" @click.prevent="openAlbumPage">← Back to album</a>
      <div class="form-page-heading">
        <p class="eyebrow">Organize your favorites</p>
        <h1>Create an album</h1>
        <p>Give your new fridge a name and choose its color.</p>
      </div>
      <form class="recipe-editor album-editor" @submit.prevent="createAlbum">
        <label>
          Album name
          <input v-model.trim="albumForm.name" required maxlength="40" placeholder="e.g. Summer favorites" />
        </label>
        <fieldset class="album-color-field">
          <legend>Fridge color</legend>
          <label v-for="color in albumColors" :key="color.value" class="album-color-option">
            <input v-model="albumForm.color" type="radio" name="album-color" :value="color.value" />
            <span class="album-color-swatch" :style="{ backgroundColor: color.value }"></span>
            {{ color.name }}
          </label>
        </fieldset>
        <div class="fridge-preview-wrap">
          <span class="fridge-illustration fridge-preview" :style="{ '--fridge-color': albumForm.color }" aria-hidden="true">
            <span class="fridge-freezer"></span>
            <span class="fridge-handle"></span>
          </span>
          <strong>{{ albumForm.name || 'Your new fridge' }}</strong>
        </div>
        <p v-if="albumError" class="form-error" role="alert">{{ albumError }}</p>
        <div class="editor-actions">
          <button class="create-button" type="submit">Create album</button>
          <button class="text-button" type="button" @click="openAlbumPage">Cancel</button>
        </div>
      </form>
    </section>
</template>

<script setup>
import { inject } from 'vue'
const { userAlbums, selectedAlbumId, selectedAlbum, displayedFavoriteRecipes, recipesInAlbum, deleteAlbum, albumError, albumIdForRecipe, openOwnedRecipe, openRecipe, ownedRecipeHref, recipeHref, assignRecipeToAlbum, toggleFavorite, openAlbumCreatePage, openAlbumPage, albumForm, albumColors, createAlbum } = inject('page-context')
</script>
