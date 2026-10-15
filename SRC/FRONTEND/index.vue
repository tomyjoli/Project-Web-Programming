<template>
  <main class="site-shell">
    <header class="topbar">
      <a class="brand" href="#/" aria-label="Banana Split, home" @click.prevent="goHome">
        <span class="brand-mark" aria-hidden="true">B</span>
        <span>Banana Split</span>
      </a>
      <nav class="navigation" aria-label="Main navigation">
        <a href="#/" @click.prevent="goHome">Recipes</a>
        <a href="#/share" @click.prevent="openSharePage">Share</a>
        <a v-if="currentUser" href="#/album" @click.prevent="openAlbumPage">Album</a>
      </nav>
      <a
        class="profile-button"
        :href="currentUser ? '#/profile' : '#/signup'"
        @click.prevent="currentUser ? openProfilePage() : openAuthPage('signup')"
      >{{ currentUser ? currentUser.username : 'Sign Up' }}</a>
    </header>
    <p v-if="favoritesError" class="favorites-error" role="alert">{{ favoritesError }}</p>

    <template v-if="currentPage === 'recipes' && !currentRecipe">
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
            <div
              v-for="(recipe, index) in featuredRecipes"
              :key="recipe.recipe_id"
              class="featured-item"
            >
              <a
                class="featured-card"
                :href="recipeHref(recipe)"
                @click.prevent="openRecipe(recipe)"
              >
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
                @click="toggleFavorite(recipe)"
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
              <input id="recipe-search" v-model="searchQuery" type="search" placeholder="Try vodka, pineapple, Tom..." />
              <button v-if="searchQuery" type="button" @click="searchQuery = ''">Clear</button>
            </label>
            <label class="filter-select">
              <span>Ingredient</span>
              <select v-model="selectedIngredient">
                <option value="">All ingredients</option>
                <option v-for="ingredient in allIngredientNames" :key="ingredient" :value="ingredient">{{ ingredient }}</option>
              </select>
            </label>
            <label class="filter-select">
              <span>Sort by</span>
              <select v-model="sortMode">
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

          <!-- The catalogue is a plain array of recipe objects, so each item is easy to inspect and display. -->
          <div v-if="filteredRecipes.length" class="recipe-list">
            <div
              v-for="recipe in filteredRecipes"
              :key="recipe.recipe_id"
              class="recipe-list-item"
            >
              <a
                class="recipe-row"
                :href="recipeHref(recipe)"
                @click.prevent="openRecipe(recipe)"
              >
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
                @click="toggleFavorite(recipe)"
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
          <a class="create-button" href="#/share/create" @click.prevent="openCreatePage">Create a recipe <span aria-hidden="true">→</span></a>
        </section>
      </div>
    </template>

    <section v-else-if="currentPage === 'recipes'" class="detail-page">
      <template v-if="currentRecipe">
        <a class="back-link" href="#/" @click.prevent="goHome">← Back to recipes</a>
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
              @click="toggleFavorite(currentRecipe)"
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
          <form class="review-form" @submit.prevent="submitReview">
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
        <a class="create-button" href="#/" @click.prevent="goHome">Back to recipes</a>
      </div>
    </section>

    <section v-else-if="currentPage === 'share'" class="detail-page share-page">
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

    <section v-else-if="currentPage === 'album'" class="detail-page album-page">
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

    <section v-else-if="currentPage === 'share-detail'" class="detail-page">
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

    <section v-else-if="currentPage === 'recipe-form'" class="detail-page form-page">
      <a class="back-link" href="#/share" @click.prevent="openSharePage">← Back to your recipes</a>
      <div class="form-page-heading">
        <p class="eyebrow">From your bar to the community</p>
        <h1>{{ editingRecipeId ? 'Edit your recipe' : 'Create a recipe' }}</h1>
        <p>Tell everyone how to make your cocktail.</p>
      </div>
      <form class="recipe-editor" @submit.prevent="saveOwnedRecipe">
        <label>
          Recipe name
          <input v-model.trim="recipeForm.title" required maxlength="100" placeholder="e.g. Sunset Spritz" />
        </label>
        <label>
          Description
          <textarea v-model.trim="recipeForm.description" required maxlength="1000" rows="4" placeholder="Describe the taste and character of your cocktail"></textarea>
        </label>

        <label class="photo-picker">
          Recipe photo <span>(optional)</span>
          <input type="file" accept="image/*" @change="handlePhotoChange" />
        </label>
        <div v-if="recipeForm.image" class="photo-preview">
          <img :src="recipeForm.image" alt="Recipe photo preview" />
          <button type="button" class="text-button" @click="recipeForm.image = ''">Remove photo</button>
        </div>
        <p v-if="photoError" class="form-error" role="alert">{{ photoError }}</p>

        <fieldset class="editor-fieldset">
          <legend>Ingredients and quantities</legend>
          <div v-for="(ingredient, index) in recipeForm.ingredients" :key="ingredient.id" class="ingredient-editor-row">
            <label>
              Ingredient
              <input v-model.trim="ingredient.name" required placeholder="e.g. White rum" />
            </label>
            <label>
              Quantity
              <input v-model.number="ingredient.quantity" required type="number" min="0.01" step="any" placeholder="5" />
            </label>
            <label>
              Unit
              <input v-model.trim="ingredient.unit" required maxlength="20" placeholder="cl, ml, slice..." />
            </label>
            <button v-if="recipeForm.ingredients.length > 1" class="remove-row-button" type="button" :aria-label="`Remove ingredient ${index + 1}`" @click="removeIngredient(index)">Remove</button>
          </div>
          <button class="text-button" type="button" @click="addIngredient">+ Add an ingredient</button>
        </fieldset>

        <fieldset class="editor-fieldset">
          <legend>Preparation steps</legend>
          <div v-for="(step, index) in recipeForm.steps" :key="step.id" class="step-editor-row">
            <span class="step-number">{{ index + 1 }}</span>
            <label>
              Step {{ index + 1 }}
              <textarea v-model.trim="step.instruction" required rows="2" placeholder="Describe what to do"></textarea>
            </label>
            <button v-if="recipeForm.steps.length > 1" class="remove-row-button" type="button" :aria-label="`Remove step ${index + 1}`" @click="removeStep(index)">Remove</button>
          </div>
          <button class="text-button" type="button" @click="addStep">+ Add a step</button>
        </fieldset>

        <label class="difficulty-field">
          Difficulty
          <select v-model="recipeForm.difficulty" required>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </label>
        <p v-if="formError" class="form-error" role="alert">{{ formError }}</p>
        <div class="editor-actions">
          <button class="create-button" type="submit">{{ editingRecipeId ? 'Save changes' : 'Publish recipe' }}</button>
          <button class="text-button" type="button" @click="openSharePage">Cancel</button>
        </div>
      </form>
    </section>

    <section v-else-if="currentPage === 'signup' || currentPage === 'signin'" class="detail-page auth-page">
      <div class="auth-card">
        <p class="eyebrow">{{ currentPage === 'signup' ? 'Join the community' : 'Welcome back' }}</p>
        <h1>{{ currentPage === 'signup' ? 'New account?' : 'Sign in' }}</h1>
        <p class="auth-note">Accounts are saved only in this browser.</p>
        <form class="recipe-editor auth-form" @submit.prevent="submitAuthForm">
          <label v-if="currentPage === 'signup'">
            Username
            <input v-model.trim="authForm.username" required maxlength="50" autocomplete="username" />
          </label>
          <label>
            Email address
            <input v-model.trim="authForm.email" required type="email" maxlength="100" autocomplete="email" />
          </label>
          <label>
            Password
            <input v-model="authForm.password" required type="password" minlength="8" :autocomplete="currentPage === 'signup' ? 'new-password' : 'current-password'" />
          </label>
          <p v-if="authError" class="form-error" role="alert">{{ authError }}</p>
          <button class="create-button" type="submit">{{ currentPage === 'signup' ? 'Create account' : 'Sign in' }}</button>
        </form>
        <a class="auth-switch" :href="currentPage === 'signup' ? '#/signin' : '#/signup'" @click.prevent="openAuthPage(currentPage === 'signup' ? 'signin' : 'signup')">
          {{ currentPage === 'signup' ? 'Already have an account? Sign in' : 'New here? Create an account' }}
        </a>
      </div>
    </section>

    <section v-else-if="currentPage === 'profile'" class="detail-page profile-page">
      <div class="form-page-heading">
        <p class="eyebrow">Your account</p>
        <h1>Your profile</h1>
      </div>
      <div class="profile-layout">
        <form class="recipe-editor profile-editor" @submit.prevent="saveProfile">
          <div class="profile-avatar">
            <img v-if="profileForm.photo" :src="profileForm.photo" alt="Profile photo" />
            <span v-else aria-hidden="true">{{ currentUser?.username.slice(0, 1).toUpperCase() }}</span>
          </div>
          <label>
            Username
            <input v-model.trim="profileForm.username" required maxlength="50" autocomplete="username" />
          </label>
          <label>
            Email address
            <input :value="currentUser?.email" type="email" readonly />
          </label>
          <label>
            Password
            <input value="••••••••" type="text" readonly aria-label="Password saved and hidden" />
          </label>
          <label>
            Description <span class="optional-label">(optional)</span>
            <textarea v-model.trim="profileForm.bio" maxlength="500" rows="4" placeholder="Tell the community a little about yourself"></textarea>
          </label>
          <label class="photo-picker">
            Profile photo <span class="optional-label">(optional, 1 MB max)</span>
            <input type="file" accept="image/*" @change="handleProfilePhotoChange" />
          </label>
          <button v-if="profileForm.photo" class="text-button" type="button" @click="profileForm.photo = ''">Remove photo</button>
          <p v-if="profileError" class="form-error" role="alert">{{ profileError }}</p>
          <p v-if="profileMessage" class="profile-message" role="status">{{ profileMessage }}</p>
          <button class="create-button" type="submit">Save profile</button>
        </form>
        <div class="profile-side">
          <form class="recipe-editor password-editor" @submit.prevent="changePassword">
            <h2>Change password</h2>
            <label>
              Current password
              <input v-model="passwordForm.current" required type="password" autocomplete="current-password" />
            </label>
            <label>
              New password
              <input v-model="passwordForm.next" required type="password" minlength="8" autocomplete="new-password" />
            </label>
            <p v-if="passwordError" class="form-error" role="alert">{{ passwordError }}</p>
            <p v-if="passwordMessage" class="profile-message" role="status">{{ passwordMessage }}</p>
            <button class="create-button" type="submit">Update password</button>
          </form>
          <section class="profile-recipes">
            <h2>Your recipes</h2>
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
                    <h3>{{ recipe.title }}</h3>
                    <p>{{ recipe.description }}</p>
                  </div>
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
            <p v-else class="no-owned-recipes">You have not created any recipes yet.</p>
            <button class="text-button" type="button" @click="signOut">Sign out</button>
          </section>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import cocktailData from '../../bananasplit.json'
import cocktailVideo from '../Images/4K Free Stock Footage Halloween Cocktail in Dark Bar with Dramatic Red Light.mp4'
import fiveIngredientPunchImage from '../Images/Five_Ingredient_Punch.jpg'
import limeGrenadineFizzImage from '../Images/lime_grenadine_fizz.jpg'
import pineappleVodkaImage from '../Images/pineapple_vodka.jpg'
import rumSunriseImage from '../Images/rum_sunrise.jpg'
import tropicalRumCoolerImage from '../Images/Tropical_Rum_Cooler.jpg'

const data = cocktailData
const users = Array.isArray(data.users) ? data.users : []
const allIngredients = Array.isArray(data.ingredients) ? data.ingredients : []
const sourceRecipes = Array.isArray(data.recipes) ? data.recipes : []
const recipeIngredients = Array.isArray(data.recipe_ingredients) ? data.recipe_ingredients : []
const preparationSteps = Array.isArray(data.preparation_steps) ? data.preparation_steps : []
const initialReviews = Array.isArray(data.reviews) ? data.reviews : []
const ownedRecipeStorageKey = 'banana-split-owned-recipes'
const accountStorageKey = 'banana-split-accounts'
const sessionStorageKey = 'banana-split-current-account'
const authError = ref('')
const profileError = ref('')
const profileMessage = ref('')
const passwordError = ref('')
const passwordMessage = ref('')
const favoritesError = ref('')
const albumError = ref('')
const selectedAlbumId = ref(null)
const albumForm = ref({ name: '', color: '#f2a18b' })
const albumColors = [
  { name: 'Red', value: '#ff0000' },
  { name: 'Green', value: '#00ff00' },
  { name: 'Blue', value: '#0000ff' },
  { name: 'Purple', value: '#800080' },
  { name: 'Yellow', value: '#ffff00' },
  { name: 'Brown', value: '#8B4513' },
]
const authForm = ref({ username: '', email: '', password: '' })
const profileForm = ref({ username: '', bio: '', photo: '' })
const passwordForm = ref({ current: '', next: '' })
const currentUser = ref(loadCurrentUser())
const imageById = {
  1: pineappleVodkaImage,
  2: rumSunriseImage,
  3: limeGrenadineFizzImage,
  4: tropicalRumCoolerImage,
  5: fiveIngredientPunchImage,
}

function loadAccounts() {
  const savedAccounts = window.localStorage.getItem(accountStorageKey)
  if (!savedAccounts) return []
  const parsedAccounts = JSON.parse(savedAccounts)
  if (!Array.isArray(parsedAccounts) || !parsedAccounts.every((account) => (
    account
    && typeof account.username === 'string'
    && typeof account.email === 'string'
    && typeof account.passwordHash === 'string'
    && typeof account.passwordSalt === 'string'
  ))) throw new TypeError('Saved account data is invalid.')
  return parsedAccounts
}

function loadCurrentUser() {
  try {
    const email = window.localStorage.getItem(sessionStorageKey)
    return email ? loadAccounts().find((account) => account.email === email) || null : null
  } catch (error) {
    console.error('Could not load the current account from local storage.', error)
    return null
  }
}

function loadOwnedRecipes() {
  try {
    const savedRecipes = window.localStorage.getItem(ownedRecipeStorageKey)
    if (!savedRecipes) return []

    const parsedRecipes = JSON.parse(savedRecipes)
    if (!Array.isArray(parsedRecipes)) throw new TypeError('Saved recipes must be an array.')

    return parsedRecipes.filter((recipe) => (
      recipe
      && currentUser.value
      && recipe.ownerEmail === currentUser.value.email
      && Number.isFinite(Number(recipe.recipe_id))
      && typeof recipe.title === 'string'
      && typeof recipe.description === 'string'
      && Array.isArray(recipe.ingredients)
      && Array.isArray(recipe.steps)
    )).map((recipe) => ({
      ...recipe,
      author: currentUser.value.username,
      createdByCurrentUser: true,
      image: typeof recipe.image === 'string' ? recipe.image : '',
      difficulty: ['easy', 'medium', 'hard'].includes(recipe.difficulty) ? recipe.difficulty : 'easy',
    }))
  } catch (error) {
    console.error('Could not load your saved recipes from local storage.', error)
    return []
  }
}

const recipes = ref([...sourceRecipes.map((recipe) => {
    const author = users.find((user) => user.user_id === recipe.user_id)?.username || 'Community'
    const recipeItems = recipeIngredients
      .filter((item) => item.recipe_id === recipe.recipe_id)
      .map((item) => {
        const ingredient = allIngredients.find((entry) => entry.ingredient_id === item.ingredient_id)
        return ingredient ? {
          name: ingredient.ingredient_name,
          quantity: item.quantity,
          unit: item.unit_of_measure,
        } : null
      })
      .filter(Boolean)

    return {
      ...recipe,
      author,
      ingredients: recipeItems,
      steps: preparationSteps
        .filter((step) => step.recipe_id === recipe.recipe_id)
        .sort((first, second) => first.step_number - second.step_number),
      preparationTime: `${Math.ceil(Number(recipe.preparation_time || 0) / 60)} min`,
      image: imageById[recipe.recipe_id] || pineappleVodkaImage,
    }
  }), ...loadOwnedRecipes()])

function loadSavedReviews() {
  try {
    const savedReviews = window.localStorage.getItem('banana-split-reviews')
    return savedReviews ? JSON.parse(savedReviews) : []
  } catch (error) {
    console.error('Could not load saved reviews from local storage.', error)
    return []
  }
}

const reviews = ref([...initialReviews, ...loadSavedReviews()])
const searchQuery = ref('')
const selectedIngredient = ref('')
const sortMode = ref('rating')
const initialRoute = readRoute()
const currentRoute = ref(
  ['profile', 'album', 'album-create', 'share', 'share-detail', 'recipe-form'].includes(initialRoute.page) && !currentUser.value
    ? { page: 'signin', recipeId: null }
    : initialRoute,
)
const reviewDraft = ref({ rating: '', comment: '' })
const reviewMessage = ref('')
let editorRowId = 0
const recipeForm = ref(createEmptyRecipeForm())
const editingRecipeId = ref(null)
const formError = ref('')
const photoError = ref('')

function createEmptyRecipeForm() {
  return {
    title: '',
    description: '',
    image: '',
    ingredients: [{ id: ++editorRowId, name: '', quantity: '', unit: '' }],
    steps: [{ id: ++editorRowId, instruction: '' }],
    difficulty: 'easy',
  }
}

const currentPage = computed(() => currentRoute.value.page)
const ownedRecipes = computed(() => [...recipes.value]
  .filter((recipe) => recipe.createdByCurrentUser)
  .sort((first, second) => second.recipe_id - first.recipe_id))
const ownedRecipe = computed(() => ownedRecipes.value.find((recipe) => recipe.recipe_id === currentRoute.value.recipeId))
const favoriteRecipes = computed(() => {
  const favoriteIds = new Set(currentUser.value?.favoriteRecipeIds || [])
  return ratedRecipes.value.filter((recipe) => favoriteIds.has(recipe.recipe_id))
})
const userAlbums = computed(() => currentUser.value?.albums || [])
const selectedAlbum = computed(() => userAlbums.value.find((album) => album.id === selectedAlbumId.value))
const displayedFavoriteRecipes = computed(() => favoriteRecipes.value.filter((recipe) => (
  !selectedAlbumId.value || albumIdForRecipe(recipe) === selectedAlbumId.value
)))

function ratingFor(recipeId) {
  const recipeRatings = reviews.value.filter((review) => review.recipe_id === recipeId)
  if (!recipeRatings.length) return '0.0'
  const average = recipeRatings.reduce((total, review) => total + Number(review.rating || 0), 0) / recipeRatings.length
  return average.toFixed(1)
}

function countReviews(recipeId) {
  return reviews.value.filter((review) => review.recipe_id === recipeId).length
}

const ratedRecipes = computed(() => recipes.value.map((recipe) => ({
  ...recipe,
  rating: ratingFor(recipe.recipe_id),
  ratingCount: countReviews(recipe.recipe_id),
})))

const currentRecipe = computed(() => ratedRecipes.value.find((recipe) => recipe.recipe_id === currentRoute.value.recipeId))

const featuredRecipes = computed(() => [...ratedRecipes.value]
  .sort((first, second) => Number(second.rating) - Number(first.rating) || second.ratingCount - first.ratingCount)
  .slice(0, 3))

const allIngredientNames = computed(() => [...new Set(recipes.value.flatMap((recipe) => recipe.ingredients.map((ingredient) => ingredient.name)))].sort())

const filteredRecipes = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  const filtered = ratedRecipes.value.filter((recipe) => {
    const searchableText = [
      recipe.title,
      recipe.description,
      recipe.author,
      ...recipe.ingredients.map((ingredient) => ingredient.name),
    ].join(' ').toLowerCase()
    const matchesSearch = !query || searchableText.includes(query)
    const matchesIngredient = !selectedIngredient.value || recipe.ingredients.some((ingredient) => ingredient.name === selectedIngredient.value)
    return matchesSearch && matchesIngredient
  })

  return filtered.sort((first, second) => sortMode.value === 'title'
    ? first.title.localeCompare(second.title)
    : Number(second.rating) - Number(first.rating) || second.ratingCount - first.ratingCount)
})

const recipeReviews = computed(() => reviews.value
  .filter((review) => review.recipe_id === currentRecipe.value?.recipe_id)
  .map((review) => ({
    ...review,
    author: review.author || users.find((user) => user.user_id === review.user_id)?.username || 'Community member',
  })))

function readRoute() {
  const route = window.location.hash
  if (route === '#/signup') return { page: 'signup', recipeId: null }
  if (route === '#/signin') return { page: 'signin', recipeId: null }
  if (route === '#/profile') return { page: 'profile', recipeId: null }
  if (route === '#/album') return { page: 'album', recipeId: null }
  if (route === '#/album/create') return { page: 'album-create', recipeId: null }
  const recipeMatch = route.match(/^#\/recipes\/(\d+)$/)
  if (recipeMatch) return { page: 'recipes', recipeId: Number(recipeMatch[1]) }
  const ownedRecipeMatch = route.match(/^#\/share\/recipes\/(\d+)$/)
  if (ownedRecipeMatch) return { page: 'share-detail', recipeId: Number(ownedRecipeMatch[1]) }
  const editMatch = route.match(/^#\/share\/edit\/(\d+)$/)
  if (editMatch) return { page: 'recipe-form', editId: Number(editMatch[1]), recipeId: null }
  if (route === '#/share/create') return { page: 'recipe-form', editId: null, recipeId: null }
  if (route === '#/share') return { page: 'share', recipeId: null }
  return { page: 'recipes', recipeId: null }
}

function syncRoute() {
  currentRoute.value = readRoute()
  if (['profile', 'album', 'album-create', 'share', 'share-detail', 'recipe-form'].includes(currentRoute.value.page) && !currentUser.value) {
    openAuthPage('signin')
    return
  }
  if (currentRoute.value.page === 'recipe-form' && currentRoute.value.editId
    && !ownedRecipes.value.some((recipe) => recipe.recipe_id === currentRoute.value.editId)) {
    openSharePage()
    return
  }
  reviewDraft.value = { rating: '', comment: '' }
  reviewMessage.value = ''
  if (currentRoute.value.page === 'recipe-form') {
    setRecipeForm(currentRoute.value.editId)
  } else {
    editingRecipeId.value = null
  }
  if (currentRoute.value.page === 'profile') loadProfileForm()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function recipeHref(recipe) {
  return `#/recipes/${recipe.recipe_id}`
}

function ownedRecipeHref(recipe) {
  return `#/share/recipes/${recipe.recipe_id}`
}

function openRecipe(recipe) {
  window.history.pushState(null, '', recipeHref(recipe))
  currentRoute.value = { page: 'recipes', recipeId: recipe.recipe_id }
  reviewDraft.value = { rating: '', comment: '' }
  reviewMessage.value = ''
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function goHome() {
  window.history.pushState(null, '', '#/')
  currentRoute.value = { page: 'recipes', recipeId: null }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function openSharePage() {
  if (!currentUser.value) {
    openAuthPage('signin')
    return
  }
  window.history.pushState(null, '', '#/share')
  currentRoute.value = { page: 'share', recipeId: null }
  editingRecipeId.value = null
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function openAlbumPage() {
  if (!currentUser.value) {
    openAuthPage('signin')
    return
  }
  favoritesError.value = ''
  albumError.value = ''
  selectedAlbumId.value = null
  window.history.pushState(null, '', '#/album')
  currentRoute.value = { page: 'album', recipeId: null }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
function openAlbumCreatePage() {
  if (!currentUser.value) {
    openAuthPage('signin')
    return
  }
  albumError.value = ''
  albumForm.value = { name: '', color: albumColors[0].value }
  window.history.pushState(null, '', '#/album/create')
  currentRoute.value = { page: 'album-create', recipeId: null }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function persistCurrentUser(updatedUser) {
  const accounts = loadAccounts()
  if (!accounts.some((account) => account.email === currentUser.value.email)) {
    throw new Error('The current account is missing from local storage.')
  }
  window.localStorage.setItem(accountStorageKey, JSON.stringify(accounts.map((account) => (
    account.email === updatedUser.email ? updatedUser : account
  ))))
  currentUser.value = updatedUser
}

function createAlbum() {
  albumError.value = ''
  if (!currentUser.value) {
    openAuthPage('signin')
    return
  }
  const name = albumForm.value.name.trim()
  if (!name) {
    albumError.value = 'Please enter a name for this album.'
    return
  }
  if (userAlbums.value.some((album) => album.name.toLowerCase() === name.toLowerCase())) {
    albumError.value = 'You already have an album with this name.'
    return
  }
  try {
    const album = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      color: albumForm.value.color,
    }
    persistCurrentUser({ ...currentUser.value, albums: [...userAlbums.value, album] })
    selectedAlbumId.value = album.id
    window.history.pushState(null, '', '#/album')
    currentRoute.value = { page: 'album', recipeId: null }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (error) {
    console.error('Could not create album in local storage.', error)
    albumError.value = 'Your album could not be saved in this browser. Please try again.'
  }
}

function albumIdForRecipe(recipe) {
  return currentUser.value?.favoriteAlbumByRecipe?.[recipe.recipe_id] || ''
}

function recipesInAlbum(albumId) {
  return favoriteRecipes.value.filter((recipe) => albumIdForRecipe(recipe) === albumId).length
}

function deleteAlbum(album) {
  if (!window.confirm(`Delete the album "${album.name}"? Your favorite recipes will remain saved.`)) return
  albumError.value = ''
  try {
    const albums = userAlbums.value.filter((item) => item.id !== album.id)
    const favoriteAlbumByRecipe = Object.fromEntries(
      Object.entries(currentUser.value?.favoriteAlbumByRecipe || {}).filter(([, albumId]) => albumId !== album.id),
    )
    persistCurrentUser({ ...currentUser.value, albums, favoriteAlbumByRecipe })
    if (selectedAlbumId.value === album.id) selectedAlbumId.value = null
  } catch (error) {
    console.error('Could not delete album from local storage.', error)
    albumError.value = 'The album could not be deleted in this browser. Please try again.'
  }
}

function assignRecipeToAlbum(recipe, event) {
  const albumId = event.target.value
  try {
    const favoriteAlbumByRecipe = { ...(currentUser.value?.favoriteAlbumByRecipe || {}) }
    if (albumId) favoriteAlbumByRecipe[recipe.recipe_id] = albumId
    else delete favoriteAlbumByRecipe[recipe.recipe_id]
    persistCurrentUser({ ...currentUser.value, favoriteAlbumByRecipe })
  } catch (error) {
    console.error('Could not move favorite recipe to an album.', error)
    favoritesError.value = 'The recipe could not be moved to that fridge. Please try again.'
  }
}
function isFavorite(recipe) {
  return Boolean(currentUser.value?.favoriteRecipeIds?.includes(recipe.recipe_id))
}

function toggleFavorite(recipe) {
  if (!currentUser.value) {
    openAuthPage('signin')
    return
  }

  favoritesError.value = ''
  try {
    const accounts = loadAccounts()
    const account = accounts.find((savedAccount) => savedAccount.email === currentUser.value.email)
    if (!account) throw new Error('The current account is missing from local storage.')
    const favoriteIds = new Set(account.favoriteRecipeIds || [])
    const favoriteAlbumByRecipe = { ...(account.favoriteAlbumByRecipe || {}) }
    if (favoriteIds.has(recipe.recipe_id)) {
      favoriteIds.delete(recipe.recipe_id)
      delete favoriteAlbumByRecipe[recipe.recipe_id]
    }
    else favoriteIds.add(recipe.recipe_id)
    const updatedUser = { ...account, favoriteRecipeIds: [...favoriteIds], favoriteAlbumByRecipe }
    window.localStorage.setItem(accountStorageKey, JSON.stringify(accounts.map((savedAccount) => (
      savedAccount.email === updatedUser.email ? updatedUser : savedAccount
    ))))
    currentUser.value = updatedUser
  } catch (error) {
    console.error('Could not update favorites in local storage.', error)
    favoritesError.value = 'Your favorites could not be saved in this browser. Please try again.'
  }
}

function openCreatePage() {
  if (!currentUser.value) {
    openAuthPage('signup')
    return
  }
  window.history.pushState(null, '', '#/share/create')
  currentRoute.value = { page: 'recipe-form', editId: null, recipeId: null }
  setRecipeForm(null)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function openEditPage(recipe) {
  if (!currentUser.value || !recipe.createdByCurrentUser) {
    openAuthPage('signin')
    return
  }
  window.history.pushState(null, '', `#/share/edit/${recipe.recipe_id}`)
  currentRoute.value = { page: 'recipe-form', editId: recipe.recipe_id, recipeId: null }
  setRecipeForm(recipe.recipe_id)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function openOwnedRecipe(recipe) {
  if (!currentUser.value || !recipe.createdByCurrentUser) {
    openAuthPage('signin')
    return
  }
  window.history.pushState(null, '', ownedRecipeHref(recipe))
  currentRoute.value = { page: 'share-detail', recipeId: recipe.recipe_id }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function openAuthPage(page) {
  authError.value = ''
  authForm.value = { username: '', email: '', password: '' }
  window.history.pushState(null, '', `#/${page}`)
  currentRoute.value = { page, recipeId: null }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function openProfilePage() {
  if (!currentUser.value) {
    openAuthPage('signup')
    return
  }
  profileError.value = ''
  profileMessage.value = ''
  passwordError.value = ''
  passwordMessage.value = ''
  loadProfileForm()
  window.history.pushState(null, '', '#/profile')
  currentRoute.value = { page: 'profile', recipeId: null }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function loadProfileForm() {
  if (!currentUser.value) return
  profileForm.value = {
    username: currentUser.value.username,
    bio: currentUser.value.bio || '',
    photo: currentUser.value.photo || '',
  }
  profileError.value = ''
  profileMessage.value = ''
  passwordError.value = ''
  passwordMessage.value = ''
}

function persistAccounts(accounts) {
  window.localStorage.setItem(accountStorageKey, JSON.stringify(accounts))
}

async function hashPassword(password, salt) {
  const cryptoKey = await window.crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const digest = await window.crypto.subtle.deriveBits({
    name: 'PBKDF2',
    salt: Uint8Array.from(salt.match(/.{2}/g), (byte) => Number.parseInt(byte, 16)),
    iterations: 100000,
    hash: 'SHA-256',
  }, cryptoKey, 256)
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function createPasswordSalt() {
  return Array.from(window.crypto.getRandomValues(new Uint8Array(16)), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function updateRecipesForCurrentUser() {
  recipes.value = [...sourceRecipes.map((recipe) => {
      const author = users.find((user) => user.user_id === recipe.user_id)?.username || 'Community'
      const recipeItems = recipeIngredients
        .filter((item) => item.recipe_id === recipe.recipe_id)
        .map((item) => {
          const ingredient = allIngredients.find((entry) => entry.ingredient_id === item.ingredient_id)
          return ingredient ? {
            name: ingredient.ingredient_name,
            quantity: item.quantity,
            unit: item.unit_of_measure,
          } : null
        })
        .filter(Boolean)

      return {
        ...recipe,
        author,
        ingredients: recipeItems,
        steps: preparationSteps
          .filter((step) => step.recipe_id === recipe.recipe_id)
          .sort((first, second) => first.step_number - second.step_number),
        preparationTime: `${Math.ceil(Number(recipe.preparation_time || 0) / 60)} min`,
        image: imageById[recipe.recipe_id] || pineappleVodkaImage,
      }
    }), ...loadOwnedRecipes()]
}

function startSession(account) {
  window.localStorage.setItem(sessionStorageKey, account.email)
  currentUser.value = account
  updateRecipesForCurrentUser()
  loadProfileForm()
  window.history.pushState(null, '', '#/profile')
  currentRoute.value = { page: 'profile', recipeId: null }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function submitAuthForm() {
  authError.value = ''
  const email = authForm.value.email.trim().toLowerCase()
  try {
    const accounts = loadAccounts()
    if (currentPage.value === 'signup') {
      const username = authForm.value.username.trim()
      if (accounts.some((account) => account.email.toLowerCase() === email)) {
        authError.value = 'An account with this email address already exists.'
        return
      }
      if (accounts.some((account) => account.username.toLowerCase() === username.toLowerCase())) {
        authError.value = 'This username is already taken.'
        return
      }
      const passwordSalt = createPasswordSalt()
      const account = {
        username,
        email,
        bio: '',
        photo: '',
        favoriteRecipeIds: [],
        favoriteAlbumByRecipe: {},
        albums: [],
        passwordSalt,
        passwordHash: await hashPassword(authForm.value.password, passwordSalt),
      }
      persistAccounts([...accounts, account])
      startSession(account)
      return
    }

    const account = accounts.find((savedAccount) => savedAccount.email.toLowerCase() === email)
    if (!account || await hashPassword(authForm.value.password, account.passwordSalt) !== account.passwordHash) {
      authError.value = 'Email address or password is incorrect.'
      return
    }
    startSession(account)
  } catch (error) {
    console.error('Could not complete account authentication.', error)
    authError.value = 'Your account could not be saved or verified in this browser. Please try again.'
  }
}

function saveProfile() {
  profileError.value = ''
  profileMessage.value = ''
  if (!currentUser.value) {
    openAuthPage('signin')
    return
  }

  try {
    const username = profileForm.value.username.trim()
    const accounts = loadAccounts()
    if (!accounts.some((account) => account.email === currentUser.value.email)) {
      throw new Error('The current account is missing from local storage.')
    }
    if (accounts.some((account) => (
      account.email !== currentUser.value.email
      && account.username.toLowerCase() === username.toLowerCase()
    ))) {
      profileError.value = 'This username is already taken.'
      return
    }
    const updatedUser = { ...currentUser.value, username, bio: profileForm.value.bio, photo: profileForm.value.photo }
    const updatedAccounts = accounts.map((account) => account.email === currentUser.value.email ? updatedUser : account)
    persistAccounts(updatedAccounts)
    currentUser.value = updatedUser
    recipes.value = recipes.value.map((recipe) => (
      recipe.createdByCurrentUser ? { ...recipe, author: updatedUser.username } : recipe
    ))
    profileMessage.value = 'Your profile has been saved.'
  } catch (error) {
    console.error('Could not load or save your profile in local storage.', error)
    profileError.value = 'Your profile could not be saved in this browser. Please try again.'
  }
}

async function changePassword() {
  passwordError.value = ''
  passwordMessage.value = ''
  if (!currentUser.value) {
    openAuthPage('signin')
    return
  }

  try {
    const accounts = loadAccounts()
    const account = accounts.find((savedAccount) => savedAccount.email === currentUser.value.email)
    if (!account || await hashPassword(passwordForm.value.current, account.passwordSalt) !== account.passwordHash) {
      passwordError.value = 'Your current password is incorrect.'
      return
    }
    const passwordSalt = createPasswordSalt()
    const updatedUser = {
      ...account,
      passwordSalt,
      passwordHash: await hashPassword(passwordForm.value.next, passwordSalt),
    }
    persistAccounts(accounts.map((savedAccount) => savedAccount.email === account.email ? updatedUser : savedAccount))
    currentUser.value = updatedUser
    passwordForm.value = { current: '', next: '' }
    passwordMessage.value = 'Your password has been updated.'
  } catch (error) {
    console.error('Could not update the account password.', error)
    passwordError.value = 'Your password could not be updated in this browser. Please try again.'
  }
}

function signOut() {
  try {
    window.localStorage.removeItem(sessionStorageKey)
    currentUser.value = null
    updateRecipesForCurrentUser()
    goHome()
  } catch (error) {
    console.error('Could not sign out of the account.', error)
    profileError.value = 'You could not be signed out. Please try again.'
  }
}

async function handleProfilePhotoChange(event) {
  const file = event.target.files?.[0]
  profileError.value = ''
  if (!file) return
  if (!file.type.startsWith('image/')) {
    profileError.value = 'Please choose an image file.'
    event.target.value = ''
    return
  }
  if (file.size > 1024 * 1024) {
    profileError.value = 'Choose a profile photo smaller than 1 MB.'
    event.target.value = ''
    return
  }
  try {
    profileForm.value.photo = await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = () => reject(reader.error || new Error('Image could not be read.'))
      reader.readAsDataURL(file)
    })
  } catch (error) {
    console.error('Could not read the selected profile photo.', error)
    profileError.value = 'The selected photo could not be read. Please try another image.'
    event.target.value = ''
  }
}

function setRecipeForm(recipeId) {
  formError.value = ''
  photoError.value = ''
  editingRecipeId.value = recipeId || null
  const recipe = recipeId ? ownedRecipes.value.find((item) => item.recipe_id === recipeId) : null
  if (!recipe) {
    recipeForm.value = createEmptyRecipeForm()
    return
  }

  recipeForm.value = {
    title: recipe.title,
    description: recipe.description,
    image: recipe.image || '',
    ingredients: recipe.ingredients.map((ingredient) => ({ ...ingredient, id: ++editorRowId })),
    steps: recipe.steps.map((step) => ({ ...step, id: ++editorRowId })),
    difficulty: recipe.difficulty,
  }
}

function addIngredient() {
  recipeForm.value.ingredients.push({ id: ++editorRowId, name: '', quantity: '', unit: '' })
}

function removeIngredient(index) {
  recipeForm.value.ingredients.splice(index, 1)
}

function addStep() {
  recipeForm.value.steps.push({ id: ++editorRowId, instruction: '' })
}

function removeStep(index) {
  recipeForm.value.steps.splice(index, 1)
}

async function handlePhotoChange(event) {
  const file = event.target.files?.[0]
  photoError.value = ''
  if (!file) return
  if (!file.type.startsWith('image/')) {
    photoError.value = 'Please choose an image file.'
    event.target.value = ''
    return
  }
  if (file.size > 1024 * 1024) {
    photoError.value = 'Choose an image smaller than 1 MB so it can be saved in this browser.'
    event.target.value = ''
    return
  }

  try {
    recipeForm.value.image = await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = () => reject(reader.error || new Error('Image could not be read.'))
      reader.readAsDataURL(file)
    })
  } catch (error) {
    console.error('Could not read the selected recipe photo.', error)
    photoError.value = 'The selected photo could not be read. Please try another image.'
    event.target.value = ''
  }
}

function persistOwnedRecipes(nextRecipes) {
  if (!currentUser.value) throw new Error('A signed-in user is required to save recipes.')
  const existingRecipes = JSON.parse(window.localStorage.getItem(ownedRecipeStorageKey) || '[]')
  if (!Array.isArray(existingRecipes)) throw new TypeError('Saved recipes must be an array.')
  const otherUsersRecipes = existingRecipes.filter((recipe) => recipe.ownerEmail !== currentUser.value.email)
  window.localStorage.setItem(ownedRecipeStorageKey, JSON.stringify([
    ...otherUsersRecipes,
    ...nextRecipes.map((recipe) => ({ ...recipe, ownerEmail: currentUser.value.email })),
  ]))
}

function saveOwnedRecipe() {
  if (!currentUser.value) {
    openAuthPage('signin')
    return
  }
  formError.value = ''
  const form = recipeForm.value
  const recipeId = editingRecipeId.value || Math.max(Date.now(), ...recipes.value.map((recipe) => Number(recipe.recipe_id) + 1))
  const recipe = {
    recipe_id: recipeId,
    title: form.title,
    description: form.description,
    image: form.image,
    author: currentUser.value.username,
    ownerEmail: currentUser.value.email,
    createdByCurrentUser: true,
    difficulty: form.difficulty,
    ingredients: form.ingredients.map((ingredient) => ({
      id: ingredient.id,
      name: ingredient.name,
      quantity: Number(ingredient.quantity),
      unit: ingredient.unit,
    })),
    steps: form.steps.map((step, index) => ({
      id: step.id,
      step_number: index + 1,
      instruction: step.instruction,
    })),
  }
  const nextRecipes = editingRecipeId.value
    ? ownedRecipes.value.map((item) => item.recipe_id === editingRecipeId.value ? recipe : item)
    : [...ownedRecipes.value, recipe]

  try {
    persistOwnedRecipes(nextRecipes)
  } catch (error) {
    console.error('Could not save your recipe to local storage.', error)
    formError.value = 'Your recipe could not be saved in this browser. Try removing the photo or choosing a smaller one.'
    return
  }

  recipes.value = [...recipes.value.filter((item) => !item.createdByCurrentUser), ...nextRecipes]
  window.history.pushState(null, '', ownedRecipeHref(recipe))
  currentRoute.value = { page: 'share-detail', recipeId: recipe.recipe_id }
  editingRecipeId.value = null
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function deleteOwnedRecipe(recipe) {
  if (!currentUser.value || !recipe.createdByCurrentUser) {
    openAuthPage('signin')
    return
  }
  if (!window.confirm('Are you really sure you want to erase this recipe?')) return
  const nextRecipes = ownedRecipes.value.filter((item) => item.recipe_id !== recipe.recipe_id)

  try {
    persistOwnedRecipes(nextRecipes)
  } catch (error) {
    console.error('Could not delete your recipe from local storage.', error)
    formError.value = 'This recipe could not be deleted from this browser. Please try again.'
    return
  }

  recipes.value = recipes.value.filter((item) => item.recipe_id !== recipe.recipe_id)
  openSharePage()
}

function submitReview() {
  if (!currentRecipe.value) return
  const newReview = {
    review_id: Date.now(),
    user_id: null,
    recipe_id: currentRecipe.value.recipe_id,
    rating: Number(reviewDraft.value.rating),
    comment: reviewDraft.value.comment,
    author: 'You',
  }
  reviews.value.unshift(newReview)

  try {
    const userReviews = reviews.value.filter((review) => review.author === 'You')
    window.localStorage.setItem('banana-split-reviews', JSON.stringify(userReviews))
    reviewMessage.value = 'Thanks! Your review has been posted.'
  } catch (error) {
    console.error('Could not save your review to local storage.', error)
    reviewMessage.value = 'Your review is visible for this visit but could not be saved.'
  }
  reviewDraft.value = { rating: '', comment: '' }
}

onMounted(() => {
  window.addEventListener('popstate', syncRoute)
  window.addEventListener('hashchange', syncRoute)
  if (['profile', 'album', 'album-create', 'share', 'share-detail', 'recipe-form'].includes(currentPage.value) && !currentUser.value) {
    openAuthPage('signin')
  } else if (currentPage.value === 'recipe-form') {
    setRecipeForm(currentRoute.value.editId)
  } else if (currentPage.value === 'profile') {
    loadProfileForm()
  }
})
onBeforeUnmount(() => {
  window.removeEventListener('popstate', syncRoute)
  window.removeEventListener('hashchange', syncRoute)
})
</script>

<style>
@font-face {
  font-family: 'Kermit Semibold';
  src: local('Kermit Semibold'), local('Kermit-Semibold');
  font-style: normal;
  font-weight: 600;
}


* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { margin: 0; background: var(--paper); color: var(--ink); font-family: 'DM Sans', sans-serif; }
button, input, select, textarea { font: inherit; }
a { color: inherit; }
.site-shell { max-width: 1240px; margin: 0 auto; padding: 0 32px; }
.topbar { display: flex; width: 100vw; height: 82px; align-items: center; justify-content: space-between; margin-left: calc(50% - 50vw); padding: 0 max(32px, calc((100vw - 1216px) / 2)); border-bottom: 2px solid var(--line); background: #fff; }
.brand { display: flex; align-items: center; gap: 10px; color: var(--ink); font-family: 'Playfair Display', serif; font-size: 21px; text-decoration: none; }
.brand-mark { display: grid; width: 36px; height: 36px; place-items: center; border: 2px solid var(--ink); border-radius: 50%; background: var(--yellow); font-family: 'DM Sans', sans-serif; font-size: 18px; font-weight: 800; }
.navigation { display: flex; gap: 26px; }
.navigation a { color: var(--muted); font-size: 13px; font-weight: 700; text-decoration: none; }
.navigation a:hover { color: var(--orange); }
.profile-button, .create-button { display: inline-flex; align-items: center; justify-content: center; gap: 10px; padding: 12px 16px; border: 2px solid var(--ink); border-radius: 11px; background: var(--yellow); color: var(--ink); cursor: pointer; font-size: 12px; font-weight: 800; text-decoration: none; }
.profile-button { max-width: min(220px, 35vw); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.hero-section { position: relative; display: grid; width: 100vw; min-height: min(660px, calc(100svh - 82px)); margin-left: calc(50% - 50vw); place-items: center; overflow: hidden; isolation: isolate; }
.hero-video, .hero-overlay { position: absolute; inset: 0; width: 100%; height: 100%; }
.hero-video { z-index: -2; object-fit: cover; object-position: center; }
.hero-overlay { z-index: -1; background: linear-gradient(90deg, rgba(44, 27, 21, .75), rgba(44, 27, 21, .25)); }
.hero-copy { width: min(780px, 100%); padding: 70px 30px; color: white; text-align: center; }
.eyebrow { margin: 0 0 12px; color: var(--orange); font-size: 11px; font-weight: 800; letter-spacing: .13em; text-transform: uppercase; }
.hero-copy .eyebrow { color: #ffd38a; }
.hero-copy h1 { max-width: 730px; margin: 0 auto 18px; font-family: 'Playfair Display', serif; font-size: clamp(43px, 7vw, 78px); line-height: .98; }
.hero-text { margin: 0 auto 26px; color: #fff4e8; font-size: 15px; }
.hero-link { display: inline-block; padding: 13px 18px; border-radius: 10px; background: var(--yellow); color: var(--ink); font-size: 12px; font-weight: 800; text-decoration: none; }
.content-shell { display: grid; max-width: 1100px; gap: 26px; margin: 0 auto; padding: 34px 0 48px; }
.page-section { padding: 76px 0; border-bottom: 2px solid var(--line); }
.content-shell .page-section { position: relative; margin: 0; padding: clamp(34px, 5vw, 58px); border: 1px solid rgba(230, 225, 217, .8); border-radius: 18px; background: #fff; box-shadow: 0 8px 26px rgba(41, 39, 35, .045); }
.content-shell .filters-section { background: linear-gradient(135deg, #fff 0%, #fffaf1 100%); }
.content-shell .page-section::after { position: absolute; right: 34px; bottom: -14px; left: 34px; height: 1px; background: linear-gradient(90deg, transparent, rgba(184, 93, 50, .18), transparent); content: ''; }
.content-shell .catalog-section::after { display: none; }
.content-shell .share-section { margin: 0 0 18px; }
.section-heading { display: flex; align-items: end; justify-content: space-between; gap: 24px; margin-bottom: 28px; }
.section-heading h2, .share-section h2, .detail-panel h2, .reviews-section h2 { margin: 0; font-family: 'Playfair Display', serif; font-size: clamp(30px, 4vw, 46px); line-height: 1.05; }
.section-copy { max-width: 330px; margin: 0; color: var(--muted); font-size: 14px; line-height: 1.6; }
.featured-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; }
.featured-item { position: relative; min-width: 0; }
.featured-card { display: block; overflow: hidden; border: 2px solid var(--ink); border-radius: 16px; background: var(--cream); box-shadow: 5px 6px 0 #f5a06e; text-decoration: none; transition: transform .18s ease, box-shadow .18s ease; }
.featured-card:hover { transform: translateY(-4px); box-shadow: 7px 9px 0 #f5a06e; }
.featured-image { position: relative; height: 220px; overflow: hidden; background: #f8dec7; }
.featured-image img { width: 100%; height: 100%; object-fit: cover; }
.featured-rank { position: absolute; top: 12px; left: 12px; padding: 7px 10px; border: 2px solid var(--ink); border-radius: 8px; background: var(--yellow); font-size: 11px; font-weight: 800; }
.featured-copy { padding: 17px 18px 20px; }
.rating-pill { color: var(--orange); font-size: 12px; font-weight: 800; }
.rating-pill span { color: var(--muted); font-weight: 600; }
.featured-copy h3 { margin: 9px 0 4px; font-family: 'Playfair Display', serif; font-size: 22px; }
.featured-copy p { margin: 0; color: var(--muted); font-size: 12px; }
.filter-controls { display: grid; grid-template-columns: minmax(250px, 1fr) 220px 190px; align-items: end; gap: 16px; }
.search-bar { display: flex; min-height: 53px; align-items: center; gap: 8px; padding: 6px 9px; border: 2px solid var(--ink); border-radius: 12px; background: white; box-shadow: 4px 5px 0 var(--orange); }
.search-bar > span { padding-left: 8px; color: var(--orange); font-size: 24px; }
.search-bar input { width: 100%; min-width: 0; border: 0; outline: 0; padding: 9px 6px; color: var(--ink); font-size: 13px; }
.search-bar button { padding: 8px 10px; border: 1px solid var(--ink); border-radius: 8px; background: var(--yellow); color: var(--ink); cursor: pointer; font-size: 11px; font-weight: 800; }
.filter-select { display: grid; gap: 7px; color: var(--muted); font-size: 11px; font-weight: 800; }
.filter-select select, .review-form select, .review-form textarea { width: 100%; min-height: 48px; border: 2px solid var(--ink); border-radius: 10px; background: var(--cream); color: var(--ink); padding: 10px; font-size: 13px; }
.recipe-count { color: var(--muted); font-size: 13px; font-weight: 700; white-space: nowrap; }
.recipe-list { display: grid; gap: 16px; }
.recipe-list-item { position: relative; min-width: 0; }
.recipe-row { display: grid; grid-template-columns: 170px minmax(0, 1fr) auto 24px; align-items: center; gap: 22px; padding: 14px; border: 2px solid var(--ink); border-radius: 15px; background: var(--cream); box-shadow: 4px 5px 0 #f5a06e; text-decoration: none; transition: transform .18s ease; }
.recipe-list-item .recipe-row { grid-template-columns: 180px minmax(0, 1fr) auto; padding-right: 58px; }
.recipe-list-item .row-arrow { display: none; }
.recipe-row:hover { transform: translateY(-3px); }
.recipe-row-image { width: 170px; height: 142px; border-radius: 9px; background: #f8dec7; object-fit: cover; }
.recipe-row-copy { min-width: 0; }
.recipe-meta { display: flex; flex-wrap: wrap; gap: 8px 15px; margin-bottom: 7px; color: var(--orange); font-size: 10px; font-weight: 800; text-transform: uppercase; }
.recipe-meta span:last-child { color: var(--muted); text-transform: none; }
.recipe-row-copy h3 { margin: 0 0 6px; font-family: 'Playfair Display', serif; font-size: 23px; }
.recipe-row-copy > p { margin: 0 0 12px; color: var(--muted); font-size: 12px; line-height: 1.5; }
.recipe-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.recipe-tags span { padding: 5px 8px; border: 1px solid var(--line); border-radius: 7px; color: var(--muted); font-size: 10px; }
.recipe-row-rating { display: grid; gap: 5px; text-align: right; }
.recipe-row-rating strong { color: var(--orange); font-size: 16px; }
.recipe-row-rating span { color: var(--muted); font-size: 10px; white-space: nowrap; }
.row-arrow { color: var(--orange); font-size: 22px; font-weight: 800; }
.empty-state { padding: 30px; border: 2px dashed var(--line); border-radius: 12px; color: var(--muted); text-align: center; }
.share-section { display: flex; align-items: center; justify-content: space-between; gap: 24px; margin: 0 0 18px; padding: 38px; border: 2px solid var(--ink); border-radius: 20px; background: #ffd8a5; box-shadow: 7px 8px 0 var(--orange); }
.share-section h2 { max-width: 540px; }
.share-section > div > p:last-child { margin: 12px 0 0; color: var(--muted); font-size: 14px; }
.create-button { background: var(--yellow); white-space: nowrap; }
.detail-page { max-width: 1030px; min-height: 75vh; margin: 0 auto; padding: 38px 0 80px; }
.back-link { display: inline-block; margin: 0 0 24px; color: var(--orange); font-size: 13px; font-weight: 800; text-decoration: none; }
.detail-card { display: grid; grid-template-columns: minmax(280px, .85fr) 1.15fr; overflow: hidden; border: 2px solid var(--ink); border-radius: 18px; background: var(--cream); box-shadow: 6px 7px 0 #f5a06e; }
.detail-image { width: 100%; height: 100%; min-height: 340px; background: #f8dec7; object-fit: cover; }
.detail-intro { align-self: center; padding: 35px; }
.detail-intro h1, .not-found h1 { margin: 0 0 14px; font-family: 'Playfair Display', serif; font-size: clamp(38px, 5vw, 58px); line-height: 1; }
.detail-description { color: var(--muted); font-size: 15px; line-height: 1.65; }
.detail-stats { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 22px; }
.detail-stats span { padding: 8px 10px; border: 1px solid var(--line); border-radius: 8px; color: var(--muted); font-size: 11px; font-weight: 700; }
.detail-stats span:first-child { color: var(--orange); }
.detail-columns { display: grid; grid-template-columns: .85fr 1.15fr; gap: 20px; margin: 30px 0 66px; }
.detail-panel { padding: 26px; border: 2px solid var(--ink); border-radius: 15px; background: var(--cream); }
.detail-panel h2, .reviews-section h2 { font-size: 30px; }
.ingredient-list, .step-list { margin: 20px 0 0; padding: 0; list-style: none; }
.ingredient-list li { display: flex; justify-content: space-between; gap: 12px; padding: 13px 0; border-bottom: 1px solid var(--line); font-size: 13px; }
.ingredient-list strong { color: var(--orange); white-space: nowrap; }
.step-list { display: grid; gap: 15px; }
.step-list li { display: grid; grid-template-columns: 30px 1fr; align-items: start; gap: 12px; }
.step-number { display: grid; width: 28px; height: 28px; place-items: center; border-radius: 50%; background: var(--yellow); font-size: 12px; font-weight: 800; }
.step-list p { margin: 3px 0 0; color: var(--muted); font-size: 13px; line-height: 1.6; }
.reviews-section { padding-top: 36px; border-top: 2px solid var(--line); }
.review-form { display: grid; grid-template-columns: 190px 1fr auto; align-items: end; gap: 14px; margin: 26px 0; padding: 20px; border: 2px solid var(--ink); border-radius: 14px; background: #ffd8a5; }
.review-form label { display: grid; gap: 7px; color: var(--ink); font-size: 11px; font-weight: 800; }
.review-form select { min-height: 44px; }
.review-form textarea { min-height: 80px; resize: vertical; }
.review-form .create-button { min-height: 44px; }
.review-message { grid-column: 1 / -1; margin: 0; color: var(--ink); font-size: 12px; font-weight: 700; }
.review-list { display: grid; gap: 12px; }
.review-card { padding: 17px 19px; border: 1px solid var(--line); border-radius: 12px; background: var(--cream); }
.review-heading { display: flex; justify-content: space-between; gap: 12px; font-size: 13px; }
.review-stars { color: var(--orange); letter-spacing: 2px; }
.review-card p { margin: 10px 0 0; color: var(--muted); font-size: 13px; line-height: 1.6; }
.not-found { padding: 70px 25px; text-align: center; }
.not-found > p:not(.eyebrow) { margin: 0 auto 24px; color: var(--muted); }
.favorite-button { display: grid; width: 38px; height: 38px; place-items: center; padding: 7px; border: 1px solid #d45a5a; border-radius: 50%; background: #fff; color: #d64545; cursor: pointer; }
.favorite-button svg { width: 100%; height: 100%; overflow: visible; }
.favorite-button path { fill: #fff; stroke: currentColor; stroke-width: 1.8; stroke-linejoin: round; transition: fill .15s ease, transform .15s ease; }
.favorite-button.is-favorite path { fill: #d64545; }
.favorite-button:hover path { transform: scale(1.08); }
.featured-item > .favorite-button { position: absolute; top: 12px; right: 12px; z-index: 1; }
.recipe-list-item > .favorite-button { position: absolute; top: 50%; right: 12px; transform: translateY(-50%); z-index: 1; }
.detail-heading-with-favorite { display: flex; align-items: start; justify-content: space-between; gap: 20px; }
.detail-heading-with-favorite > div { min-width: 0; }
.detail-heading-with-favorite .favorite-button { flex: 0 0 auto; margin-top: 5px; }
.favorites-error { max-width: 1120px; margin: 12px auto 0; color: #a13e2e; font-size: 12px; }

@media (max-width: 800px) {
  .site-shell { padding: 0 20px; }
  .topbar { padding: 0 20px; }
  .featured-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .filter-controls { grid-template-columns: 1fr 1fr; }
  .search-bar { grid-column: 1 / -1; }
  .recipe-row { grid-template-columns: 125px minmax(0, 1fr) auto; gap: 14px; }
  .recipe-list-item .recipe-row { grid-template-columns: 125px minmax(0, 1fr) auto; }
  .recipe-row-image { width: 125px; height: 125px; }
  .row-arrow { display: none; }
  .recipe-row-rating { grid-column: 2 / -1; grid-row: 2; justify-self: start; text-align: left; }
  .recipe-row-copy { grid-column: 2 / -1; grid-row: 1; }
  .detail-card { grid-template-columns: 1fr; }
  .detail-image { height: 300px; min-height: 0; }
  .detail-columns { grid-template-columns: 1fr; }
  .review-form { grid-template-columns: 1fr 2fr; }
  .review-form .create-button { grid-column: 1 / -1; justify-self: start; }
}

@media (max-width: 560px) {
  .site-shell { padding: 0 16px; }
  .topbar { height: 70px; padding: 0 16px; }
  .brand { font-size: 18px; }
  .navigation { gap: 13px; }
  .navigation a { font-size: 11px; }
  .profile-button { padding: 9px 10px; font-size: 10px; }
  .hero-section { min-height: 490px; }
  .hero-copy { padding: 50px 22px; }
  .page-section { padding: 55px 0; }
  .content-shell { gap: 18px; padding: 22px 0 34px; }
  .content-shell .page-section { padding: 32px 22px; border-radius: 14px; }
  .content-shell .page-section::after { right: 24px; left: 24px; }
  .content-shell .share-section { margin: 0 0 12px; padding: 25px; }
  .section-heading { align-items: start; flex-direction: column; gap: 12px; }
  .featured-grid { grid-template-columns: 1fr; }
  .featured-image { height: 230px; }
  .filter-controls { grid-template-columns: 1fr; }
  .search-bar { grid-column: auto; }
  .recipe-row { grid-template-columns: 90px minmax(0, 1fr); gap: 12px; padding: 10px; }
  .recipe-list-item .recipe-row { grid-template-columns: 90px minmax(0, 1fr); padding-right: 52px; }
  .recipe-row-image { grid-column: 1; grid-row: 1; width: 90px; height: 105px; }
  .recipe-row-copy { grid-column: 2; grid-row: 1; }
  .recipe-row-copy h3 { font-size: 18px; }
  .recipe-row-copy > p { font-size: 11px; }
  .recipe-row-rating { grid-column: 2; grid-row: 2; }
  .recipe-meta { font-size: 9px; }
  .share-section { align-items: start; flex-direction: column; margin: 45px 0 55px; padding: 25px; }
  .detail-page { padding-top: 25px; }
  .detail-intro { padding: 25px; }
  .detail-image { height: 240px; }
  .detail-columns { margin-bottom: 48px; }
  .detail-panel { padding: 20px; }
  .review-form { grid-template-columns: 1fr; }
  .review-form .create-button, .review-message { grid-column: auto; }
}

:root {
  --ink: #292723;
  --muted: #716b63;
  --paper: #fff8e4;
  --line: #e6e1d9;
  --orange: #b85d32;
  --yellow: #edc65a;
  --cream: #fff;
  --font-family: 'Kermit Semibold', 'Segoe UI', Arial, sans-serif;
}

body, button, input, select, textarea {
  font-family: var(--font-family);
}

.brand, .hero-copy h1, .section-heading h2, .share-section h2,
.detail-panel h2, .reviews-section h2, .featured-copy h3,
.recipe-row-copy h3, .detail-heading h1, .not-found h1 {
  font-family: var(--font-family);
  font-weight: 600;
  letter-spacing: -.025em;
}

.site-shell { max-width: 1280px; }
.content-shell { max-width: 1120px; }
.topbar { height: 76px; border-bottom-width: 1px; }
.brand-mark { border: 0; }
.profile-button, .create-button { border: 1px solid #d7a92c; border-radius: 7px; }
.hero-section { min-height: min(570px, calc(100svh - 76px)); }
.hero-overlay { background: linear-gradient(90deg, rgba(35, 30, 25, .67), rgba(35, 30, 25, .2)); }
.hero-copy h1 { line-height: 1.05; }
.hero-link { border-radius: 7px; }
.page-section { border-bottom-width: 1px; }
.featured-card { border: 1px solid var(--line); border-radius: 9px; box-shadow: 0 3px 14px rgba(41, 39, 35, .06); }
.featured-card:hover { transform: translateY(-2px); box-shadow: 0 7px 20px rgba(41, 39, 35, .1); }
.featured-image { height: 230px; }
.featured-rank { border: 0; border-radius: 5px; }
.filter-controls { gap: 18px; }
.search-bar { min-height: 49px; border: 1px solid var(--line); border-radius: 7px; box-shadow: none; }
.search-bar button { border: 0; border-radius: 5px; }
.filter-select select, .review-form select, .review-form textarea { border: 1px solid #d8d2c8; border-radius: 7px; }
.recipe-row { grid-template-columns: 180px minmax(0, 1fr) auto 20px; gap: 22px; padding: 12px; border: 1px solid var(--line); border-radius: 9px; box-shadow: 0 2px 10px rgba(41, 39, 35, .045); }
.recipe-row:hover { transform: translateY(-2px); }
.recipe-row-image { width: 180px; height: 136px; border-radius: 5px; }
.recipe-row-copy > p, .section-copy, .share-section > div > p:last-child { line-height: 1.65; }
.recipe-tags span { border-radius: 4px; }
.share-section { margin: 58px 0 72px; padding: 34px; border: 1px solid var(--line); border-radius: 10px; background: #f2eee6; box-shadow: none; }
.detail-page { max-width: 1080px; padding-top: 30px; }
.back-link { color: var(--muted); font-weight: 600; }
.back-link:hover { color: var(--orange); }
.recipe-detail { margin-bottom: 30px; }
.detail-heading { max-width: 800px; margin-bottom: 24px; }
.detail-heading .eyebrow { margin-bottom: 10px; }
.detail-heading h1 { margin: 0 0 12px; font-size: clamp(38px, 5vw, 58px); line-height: 1.08; }
.detail-description { max-width: 720px; margin: 0; color: var(--muted); font-size: 15px; line-height: 1.7; }
.detail-hero { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(230px, .7fr); overflow: hidden; border: 1px solid var(--line); border-radius: 9px; background: var(--cream); }
.detail-image { display: block; width: 100%; height: 420px; min-height: 0; background: #f1eee8; object-fit: cover; }
.detail-stats { display: flex; align-content: center; flex-direction: column; justify-content: center; gap: 0; margin: 0; padding: 25px; }
.detail-stats span { display: grid; gap: 6px; padding: 17px 0; border: 0; border-bottom: 1px solid var(--line); border-radius: 0; color: var(--ink); font-size: 14px; font-weight: 600; }
.detail-stats span:last-child { border-bottom: 0; }
.detail-stats span small { color: var(--muted); font-size: 9px; font-weight: 600; letter-spacing: .08em; }
.detail-stats .detail-rating { color: var(--orange); }
.detail-stats .detail-rating small { color: var(--muted); letter-spacing: normal; }
.detail-columns { grid-template-columns: minmax(250px, .72fr) minmax(0, 1.28fr); gap: 30px; margin: 34px 0 58px; }
.detail-panel { padding: 27px; border: 1px solid var(--line); border-radius: 9px; background: var(--cream); }
.detail-panel h2, .reviews-section h2 { font-size: 29px; }
.ingredient-list li { padding: 14px 0; border-bottom: 1px solid var(--line); }
.ingredient-list strong { color: var(--ink); font-weight: 600; }
.step-list { gap: 19px; }
.step-list li { grid-template-columns: 34px 1fr; gap: 13px; }
.step-number { width: 30px; height: 30px; border: 1px solid #e3d6b2; background: #f8f1dd; color: var(--ink); }
.step-list p { color: #514c45; font-size: 14px; line-height: 1.7; }
.reviews-section { padding-top: 32px; border-top: 1px solid var(--line); }
.review-form { border: 1px solid var(--line); border-radius: 9px; background: #f2eee6; }
.review-form label { font-weight: 600; }
.review-form .create-button { border: 0; }
.review-card { border: 1px solid var(--line); border-radius: 8px; background: white; }
.not-found h1 { line-height: 1.1; }

@media (max-width: 800px) {
  .detail-hero { grid-template-columns: 1fr; }
  .detail-image { height: 360px; }
  .detail-stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; padding: 18px; }
  .detail-stats span { align-content: start; padding: 8px 0; border-bottom: 0; }
  .detail-columns { gap: 16px; }
}

@media (max-width: 560px) {
  .detail-heading h1 { font-size: 40px; }
  .detail-image { height: 260px; }
  .detail-stats { grid-template-columns: 1fr; gap: 0; padding: 12px 20px; }
  .detail-stats span { padding: 12px 0; border-bottom: 1px solid var(--line); }
  .detail-columns { margin-bottom: 42px; }
}

.share-page > .section-heading { align-items: center; }
.share-page .section-heading h1 { margin: 0; font-size: clamp(34px, 4vw, 46px); font-weight: 600; }
.share-page .section-heading .section-copy { margin-top: 12px; }
.no-owned-recipes { margin: 70px 0; color: #96918a; font-size: 15px; text-align: center; }
.recipe-image-placeholder { display: grid; place-items: center; color: #a39b8f; font-size: 42px; }
.featured-image .recipe-image-placeholder { width: 100%; height: 100%; }
.owned-recipe-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 18px; }
.owned-recipe-actions .create-button { border: 0; }
.delete-button, .remove-row-button { padding: 11px 15px; border: 1px solid #d5c7bd; border-radius: 7px; background: white; color: #8e493a; cursor: pointer; font-size: 12px; font-weight: 600; }
.form-page-heading { margin: 0 0 27px; }
.form-page-heading h1 { margin: 0 0 10px; font-size: clamp(36px, 5vw, 52px); font-weight: 600; letter-spacing: -.025em; }
.form-page-heading > p:last-child { color: var(--muted); font-size: 14px; }
.recipe-editor { display: grid; gap: 20px; max-width: 860px; padding: 28px; border: 1px solid var(--line); border-radius: 10px; background: white; }
.recipe-editor > label, .ingredient-editor-row label, .step-editor-row label { display: grid; gap: 8px; color: var(--ink); font-size: 12px; font-weight: 600; }
.recipe-editor input:not([type="file"]), .recipe-editor textarea, .recipe-editor select { width: 100%; min-height: 45px; border: 1px solid #d8d2c8; border-radius: 6px; background: white; color: var(--ink); padding: 11px 12px; font-size: 13px; }
.recipe-editor textarea { resize: vertical; }
.photo-picker span { display: inline; color: var(--muted); font-weight: 400; }
.recipe-editor input[type="file"] { display: block; margin-top: 2px; color: var(--muted); font-size: 12px; }
.photo-preview { display: flex; align-items: center; gap: 16px; }
.photo-preview img { width: 150px; height: 110px; border-radius: 6px; object-fit: cover; }
.text-button { justify-self: start; border: 0; background: transparent; color: #8b572b; cursor: pointer; font-size: 12px; font-weight: 600; }
.editor-fieldset { display: grid; gap: 15px; margin: 0; padding: 20px; border: 1px solid var(--line); border-radius: 7px; }
.editor-fieldset legend { padding: 0 7px; font-size: 15px; font-weight: 600; }
.ingredient-editor-row { display: grid; grid-template-columns: minmax(150px, 1fr) minmax(100px, .55fr) minmax(120px, .65fr) auto; align-items: end; gap: 12px; padding-bottom: 14px; border-bottom: 1px solid #eeeae4; }
.ingredient-editor-row:last-of-type { border-bottom: 0; }
.remove-row-button { padding: 10px; font-size: 11px; }
.step-editor-row { display: grid; grid-template-columns: 30px minmax(0, 1fr) auto; align-items: start; gap: 12px; padding-bottom: 14px; border-bottom: 1px solid #eeeae4; }
.step-editor-row .step-number { margin-top: 23px; }
.step-editor-row .remove-row-button { margin-top: 20px; }
.difficulty-field { max-width: 260px; }
.form-error { margin: 0; color: #a13e2e; font-size: 12px; line-height: 1.5; }
.editor-actions { display: flex; align-items: center; gap: 15px; padding-top: 4px; }
.editor-actions .create-button { border: 0; }
.auth-page { display: grid; place-items: start center; }
.auth-card { width: min(100%, 470px); margin-top: 30px; }
.auth-card h1 { margin: 0 0 25px; font-size: clamp(36px, 5vw, 52px); font-weight: 600; }
.auth-note { margin: -12px 0 18px; color: var(--muted); font-size: 12px; }
.auth-form { max-width: none; }
.auth-form .create-button, .profile-editor > .create-button, .password-editor > .create-button { justify-self: start; border: 0; }
.auth-switch { display: inline-block; margin-top: 18px; color: #8a857f; font-size: 13px; text-decoration: underline; text-underline-offset: 3px; }
.auth-switch:hover { color: var(--ink); }
.profile-layout { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); align-items: start; gap: 24px; }
.profile-editor, .password-editor { max-width: none; }
.profile-side { display: grid; gap: 24px; }
 .profile-avatar { display: grid; width: 100px; height: 100px; place-items: center; overflow: hidden; border-radius: 50%; background: #f2eee6; color: var(--orange); font-size: 40px; font-weight: 600; }
.profile-avatar img { width: 100%; height: 100%; object-fit: cover; }
.optional-label { color: var(--muted); font-size: 11px; font-weight: 400; }
.profile-message { margin: 0; color: #38764a; font-size: 12px; line-height: 1.5; }
.password-editor h2, .profile-recipes h2 { margin: 0; font-size: 22px; font-weight: 600; }
.profile-recipes { display: grid; gap: 18px; }
.profile-recipes .recipe-row { grid-template-columns: 100px minmax(0, 1fr); gap: 14px; padding: 10px; }
.profile-recipes .recipe-list-item .recipe-row { grid-template-columns: 100px minmax(0, 1fr); padding-right: 52px; }
.profile-recipes .recipe-row-image { width: 100px; height: 90px; }
.profile-recipes .recipe-row-copy h3 { font-size: 17px; }
.profile-recipes .recipe-row-copy > p { margin-bottom: 0; }
.profile-recipes .no-owned-recipes { margin: 0; text-align: left; }
.profile-recipes > .text-button { color: #8a857f; }
.album-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 18px; margin: 0 0 20px; }
.album-toolbar h2 { margin: 0; font-size: 24px; font-weight: 600; }
.fridge-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(155px, 1fr)); gap: 16px; margin-bottom: 38px; }
.fridge-card-item { position: relative; min-width: 0; }
.fridge-card { display: grid; min-height: 190px; justify-items: center; align-content: center; gap: 9px; padding: 18px 12px; border: 1px solid var(--line); border-radius: 10px; background: white; color: var(--ink); cursor: pointer; transition: border-color .15s ease, box-shadow .15s ease, transform .15s ease; }
.fridge-card-item .fridge-card { width: 100%; padding-bottom: 40px; }
.fridge-card:hover, .fridge-card.is-selected { border-color: var(--orange); box-shadow: 0 4px 14px rgba(41, 39, 35, .1); transform: translateY(-2px); }
.fridge-card > strong { font-size: 14px; }
.fridge-card > span:last-child { color: var(--muted); font-size: 11px; }
.fridge-illustration { position: relative; display: block; width: 82px; height: 116px; overflow: hidden; border: 2px solid rgba(41, 39, 35, .55); border-radius: 8px 8px 5px 5px; background: var(--fridge-color); box-shadow: inset 5px 0 rgba(255, 255, 255, .2), 3px 4px 0 rgba(41, 39, 35, .12); }
.fridge-freezer { position: absolute; top: 31%; right: 0; left: 0; border-top: 2px solid rgba(41, 39, 35, .4); }
.fridge-handle { position: absolute; top: 12%; right: 9px; width: 4px; height: 17px; border-radius: 3px; background: rgba(41, 39, 35, .65); box-shadow: 0 45px 0 rgba(41, 39, 35, .65); }
.delete-album-button { position: absolute; bottom: 10px; left: 50%; padding: 5px 9px; transform: translateX(-50%); border: 1px solid #e1b7b0; border-radius: 5px; background: white; color: #a13e2e; cursor: pointer; font-size: 11px; }
.delete-album-button:hover { background: #fff1ee; }
.album-error { margin: -20px 0 28px; }
.album-empty { margin: 0 0 32px; }
.favorites-toolbar { margin-top: 0; }
.recipe-album-select { display: inline-flex; align-items: center; gap: 8px; margin-top: 10px; color: var(--muted); font-size: 11px; font-weight: 600; }
.recipe-album-select select { max-width: 190px; min-height: 32px; border: 1px solid var(--line); border-radius: 5px; background: white; color: var(--ink); padding: 5px 8px; font-size: 11px; }
.album-page .recipe-list-item .recipe-row { padding-bottom: 48px; }
.album-page .recipe-list-item > .recipe-album-select { position: absolute; right: 60px; bottom: 8px; z-index: 2; margin: 0; }
.album-editor { max-width: 620px; }
.album-color-field { display: flex; flex-wrap: wrap; gap: 12px 20px; margin: 0; padding: 16px; border: 1px solid var(--line); border-radius: 7px; }
.album-color-field legend { padding: 0 6px; font-size: 13px; font-weight: 600; }
.album-color-option { display: inline-flex; align-items: center; gap: 7px; color: var(--muted); cursor: pointer; font-size: 12px; }
.album-color-option input { width: 15px !important; min-height: 0 !important; accent-color: var(--orange); }
.album-color-swatch { width: 18px; height: 18px; border: 1px solid rgba(41, 39, 35, .2); border-radius: 50%; }
.fridge-preview-wrap { display: grid; justify-items: center; gap: 12px; padding: 20px; border: 1px dashed var(--line); border-radius: 8px; color: var(--muted); font-size: 13px; }
.fridge-preview { width: 100px; height: 140px; }
.fridge-preview .fridge-handle { right: 12px; }

@media (max-width: 700px) {
  .recipe-editor { padding: 20px; }
  .ingredient-editor-row { grid-template-columns: 1fr 1fr; }
  .ingredient-editor-row label:first-child { grid-column: 1 / -1; }
  .ingredient-editor-row .remove-row-button { justify-self: start; }
  .profile-layout { grid-template-columns: 1fr; }
  .album-toolbar { align-items: start; flex-direction: column; }
  .recipe-album-select { align-items: start; flex-direction: column; }
}

@media (max-width: 480px) {
  .share-page > .section-heading { align-items: start; }
  .recipe-editor { padding: 16px; }
  .editor-fieldset { padding: 15px; }
  .step-editor-row { grid-template-columns: 28px minmax(0, 1fr); }
  .step-editor-row .remove-row-button { grid-column: 2; margin-top: 0; }
}
</style>
