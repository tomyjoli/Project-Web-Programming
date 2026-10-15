<template>
    <section class="detail-page profile-page">
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
</template>

<script setup>
import { inject } from 'vue'
const { currentUser, profileForm, handleProfilePhotoChange, profileError, profileMessage, saveProfile, passwordForm, passwordError, passwordMessage, changePassword, ownedRecipes, ownedRecipeHref, openOwnedRecipe, isFavorite, toggleFavorite, signOut } = inject('page-context')
</script>
