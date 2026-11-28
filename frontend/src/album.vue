<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { apiGet, apiRequest } from './api.js'
import { authError, authInitialized, currentUser, initializeAuth } from '../auth.js'

const albums = ref([])
const albumName = ref('')
const albumColor = ref('#f4a261')
const recipeToAdd = ref('')
const selectedAlbumId = ref(null)
const selectedAlbum = computed(() => (
  albums.value.find((album) => album.album_id === selectedAlbumId.value) ?? null
))
const availableRecipes = computed(() => (
  myRecipes.value.filter((recipe) => (
    !selectedAlbum.value?.recipes.some((item) => item.recipe_id === recipe.recipe_id)
  ))
))
const myRecipes = ref([])
const ingredients = ref([])
const loadingRecipes = ref(false)
const isSavingRecipe = ref(false)
const recipeError = ref('')
const recipeMessage = ref('')
const editingRecipeId = ref(null)
const recipeForm = ref(emptyRecipeForm())
let nextEditorRowId = 1

function emptyRecipeForm() {
  return {
    title: '',
    category: '',
    description: '',
    photo_url: '',
    preparation_time: '',
    glass_name: '',
    capacity_cl: '',
    recipe_ingredients: [],
    preparation_steps: [],
  }
}

onMounted(async () => {
  await initializeAuth()
  if (currentUser.value) await loadUserData()
})

async function loadUserData() {
  loadingRecipes.value = true
  recipeError.value = ''
  try {
    const [recipes, availableIngredients, userAlbums] = await Promise.all([
      apiGet('/recipesapi/recipes/mine'),
      apiGet('/recipesapi/ingredients'),
      apiGet('/albumsapi'),
    ])
    myRecipes.value = recipes
    ingredients.value = availableIngredients
    albums.value = userAlbums
  } catch (error) {
    recipeError.value = error.message
  } finally {
    loadingRecipes.value = false
  }
}

function startEditing(recipe) {
  editingRecipeId.value = recipe.recipe_id
  recipeError.value = ''
  recipeMessage.value = ''
  recipeForm.value = {
    title: recipe.title,
    category: recipe.category,
    description: recipe.description || '',
    photo_url: recipe.photo_url || '',
    preparation_time: recipe.preparation_time ?? '',
    glass_name: recipe.glass_name || '',
    capacity_cl: recipe.capacity_cl || '',
    recipe_ingredients: recipe.ingredients.map((item) => ({
      rowId: nextEditorRowId++,
      ingredient_id: item.ingredient_id,
      quantity: item.quantity,
      unit_of_measure: item.unit_of_measure,
    })),
    preparation_steps: recipe.preparationSteps.map((step) => ({
      rowId: nextEditorRowId++,
      instruction: step.instruction,
    })),
  }
}

function cancelEditing() {
  editingRecipeId.value = null
  recipeForm.value = emptyRecipeForm()
  recipeError.value = ''
}

function addRecipeIngredient() {
  recipeForm.value.recipe_ingredients.push({
    rowId: nextEditorRowId++,
    ingredient_id: '',
    quantity: '',
    unit_of_measure: '',
  })
}

function removeRecipeIngredient(index) {
  recipeForm.value.recipe_ingredients.splice(index, 1)
}

function addPreparationStep() {
  recipeForm.value.preparation_steps.push({ rowId: nextEditorRowId++, instruction: '' })
}

function removePreparationStep(index) {
  recipeForm.value.preparation_steps.splice(index, 1)
}

async function saveRecipe() {
  if (!editingRecipeId.value) return
  isSavingRecipe.value = true
  recipeError.value = ''
  recipeMessage.value = ''
  try {
    const updatedRecipe = await apiRequest(`/recipesapi/recipes/${editingRecipeId.value}`, {
      method: 'PUT',
      body: {
        recipe: {
          title: recipeForm.value.title,
          category: recipeForm.value.category,
          description: recipeForm.value.description || null,
          photo_url: recipeForm.value.photo_url || null,
          preparation_time: recipeForm.value.preparation_time
            ? Number(recipeForm.value.preparation_time)
            : null,
          glass_name: recipeForm.value.glass_name || null,
          capacity_cl: recipeForm.value.capacity_cl ? Number(recipeForm.value.capacity_cl) : null,
        },
        recipe_ingredients: recipeForm.value.recipe_ingredients.map((item) => ({
          ingredient_id: Number(item.ingredient_id),
          quantity: Number(item.quantity),
          unit_of_measure: item.unit_of_measure,
        })),
        preparation_steps: recipeForm.value.preparation_steps.map((step) => ({
          instruction: step.instruction,
        })),
      },
    })
    myRecipes.value = myRecipes.value.map((recipe) => (
      recipe.recipe_id === updatedRecipe.recipe_id ? updatedRecipe : recipe
    ))
    albums.value.forEach((album) => {
      album.recipes = album.recipes.map((recipe) => (
        recipe.recipe_id === updatedRecipe.recipe_id ? updatedRecipe : recipe
      ))
    })
    editingRecipeId.value = null
    recipeForm.value = emptyRecipeForm()
    recipeMessage.value = 'Your recipe has been updated.'
  } catch (error) {
    recipeError.value = error.message
  } finally {
    isSavingRecipe.value = false
  }
}

async function deleteRecipe(recipe) {
  const confirmed = window.confirm(
    `Delete "${recipe.title}"? This will also delete its reviews and cannot be undone.`,
  )
  if (!confirmed) return

  recipeError.value = ''
  recipeMessage.value = ''
  try {
    await apiRequest(`/recipesapi/recipes/${recipe.recipe_id}`, { method: 'DELETE' })
    myRecipes.value = myRecipes.value.filter((item) => item.recipe_id !== recipe.recipe_id)
    albums.value.forEach((album) => {
      album.recipes = album.recipes.filter((item) => item.recipe_id !== recipe.recipe_id)
    })
    if (editingRecipeId.value === recipe.recipe_id) cancelEditing()
    recipeMessage.value = `"${recipe.title}" has been deleted.`
  } catch (error) {
    recipeError.value = error.message
  }
}

async function createAlbum() {
  const name = albumName.value.trim()
  if (!name) return

  recipeError.value = ''
  recipeMessage.value = ''
  try {
    const album = await apiRequest('/albumsapi', {
      method: 'POST',
      body: { name, color: albumColor.value },
    })
    albums.value.unshift(album)
    selectedAlbumId.value = album.album_id
    albumName.value = ''
  } catch (error) {
    recipeError.value = error.message
  }
}

async function removeAlbum() {
  if (!selectedAlbumId.value) return
  const album = selectedAlbum.value
  if (!window.confirm(`Delete "${album.name}"? Its recipes will remain in your account.`)) return

  recipeError.value = ''
  recipeMessage.value = ''
  try {
    await apiRequest(`/albumsapi/${album.album_id}`, { method: 'DELETE' })
    albums.value = albums.value.filter((item) => item.album_id !== album.album_id)
    selectedAlbumId.value = null
    recipeMessage.value = `"${album.name}" has been deleted.`
  } catch (error) {
    recipeError.value = error.message
  }
}

function openAlbum(album) {
  selectedAlbumId.value = selectedAlbumId.value === album.album_id ? null : album.album_id
  recipeToAdd.value = ''
}

async function addRecipeToAlbum() {
  if (!selectedAlbum.value || !recipeToAdd.value) return
  const recipeId = Number(recipeToAdd.value)
  recipeError.value = ''
  recipeMessage.value = ''
  try {
    await apiRequest(`/albumsapi/${selectedAlbum.value.album_id}/recipes`, {
      method: 'POST',
      body: { recipe_id: recipeId },
    })
    const recipe = myRecipes.value.find((item) => item.recipe_id === recipeId)
    if (recipe) selectedAlbum.value.recipes.push(recipe)
    recipeToAdd.value = ''
    recipeMessage.value = 'Recipe added to this fridge.'
  } catch (error) {
    recipeError.value = error.message
  }
}

async function removeRecipeFromAlbum(recipe) {
  if (!selectedAlbum.value) return
  recipeError.value = ''
  recipeMessage.value = ''
  try {
    await apiRequest(
      `/albumsapi/${selectedAlbum.value.album_id}/recipes/${recipe.recipe_id}`,
      { method: 'DELETE' },
    )
    selectedAlbum.value.recipes = selectedAlbum.value.recipes.filter(
      (item) => item.recipe_id !== recipe.recipe_id,
    )
    recipeMessage.value = `"${recipe.title}" was removed from this fridge.`
  } catch (error) {
    recipeError.value = error.message
  }
}

</script>

<template>
  <main class="albums-page">
    <header class="albums-introduction">
      <h1>Your fridge, your recipes</h1>
      <p>Keep your favorite creations together in colorful little fridges.</p>
    </header>

    <section class="album-section" aria-labelledby="fridges-heading">
      <div class="section-heading">
        <div>
          <h2 id="fridges-heading">My fridges</h2>
        </div>
        <span class="album-count">{{ albums.length }} {{ albums.length === 1 ? 'fridge' : 'fridges' }}</span>
      </div>

      <p v-if="!authInitialized" class="recipe-notice" role="status">Checking your sign-in session…</p>
      <section v-else-if="!currentUser" class="empty-fridges">
        <h3>Sign in to manage your fridges</h3>
        <RouterLink class="share-link" to="/users">Sign in</RouterLink>
        <p v-if="authError" class="recipe-error" role="alert">{{ authError }}</p>
      </section>

      <template v-else>
      <p v-if="recipeError" class="recipe-notice recipe-error" role="alert">{{ recipeError }}</p>
      <p v-if="recipeMessage" class="recipe-notice recipe-success" role="status">{{ recipeMessage }}</p>
      <p v-if="loadingRecipes" class="recipe-notice" role="status">Loading your fridges…</p>

      <form class="create-album-form" @submit.prevent="createAlbum">
        <label class="album-name-field">
          <span>Name your fridge</span>
          <input
            v-model="albumName"
            type="text"
            maxlength="40"
            placeholder="e.g. Summer favorites"
            required
          >
        </label>

        <label class="album-color-field">
          <span>Pick a color</span>
          <input v-model="albumColor" type="color" aria-label="Fridge color">
        </label>

        <button class="create-album-button" type="submit">+ Create a fridge</button>
      </form>

      <div v-if="albums.length" class="fridge-grid">
        <button
          v-for="album in albums"
          :key="album.album_id"
          class="fridge-card"
          :class="{ 'fridge-card-selected': selectedAlbumId === album.album_id }"
          :style="{ '--fridge-color': album.color }"
          type="button"
          :aria-pressed="selectedAlbumId === album.album_id"
          @click="openAlbum(album)"
        >
          <span class="fridge-top">
            <span class="fridge-freezer"></span>
            <span class="fridge-handle"></span>
          </span>
          <span class="fridge-bottom">
            <span class="fridge-handle"></span>
            <span class="fridge-magnet fridge-magnet-one"></span>
            <span class="fridge-magnet fridge-magnet-two"></span>
          </span>
          <span class="fridge-label">{{ album.name }}</span>
        </button>
      </div>

      <div v-else class="empty-fridges">
        <span class="empty-fridge-icon" aria-hidden="true">▯</span>
        <p>Your fridge collection is empty.</p>
        <p>Give your first fridge a name and a color to get started.</p>
      </div>

      <article v-if="selectedAlbum" class="selected-album">
        <div class="selected-album-heading">
          <span class="selected-album-swatch" :style="{ backgroundColor: selectedAlbum.color }"></span>
          <h3>{{ selectedAlbum.name }}</h3>
        </div>
        <form class="add-to-album-form" @submit.prevent="addRecipeToAlbum">
          <label class="album-name-field">
            <span>Add one of your recipes</span>
            <select v-model="recipeToAdd" :disabled="!availableRecipes.length" required>
              <option value="" disabled>
                {{ availableRecipes.length ? 'Select a published recipe' : 'All your recipes are already here' }}
              </option>
              <option
                v-for="recipe in availableRecipes"
                :key="recipe.recipe_id"
                :value="recipe.recipe_id"
              >
                {{ recipe.title }}
              </option>
            </select>
          </label>
          <button
            class="create-album-button"
            type="submit"
            :disabled="!recipeToAdd || !availableRecipes.length"
          >
            Add recipe
          </button>
        </form>

        <div v-if="selectedAlbum.recipes.length" class="album-recipe-list">
          <article
            v-for="recipe in selectedAlbum.recipes"
            :key="recipe.recipe_id"
            class="album-recipe-item"
          >
            <div>
              <h4>{{ recipe.title }}</h4>
              <p>
                {{ recipe.category }}
                <template v-if="recipe.glass_name"> · {{ recipe.glass_name }}</template>
                <template v-if="recipe.capacity_cl"> · {{ recipe.capacity_cl }} cl</template>
              </p>
            </div>
            <button type="button" class="remove-from-album-button" @click="removeRecipeFromAlbum(recipe)">
              Remove
            </button>
          </article>
        </div>
        <p v-else class="album-empty-content">This fridge is empty. Add one of your published recipes above.</p>
        <button class="remove-button" type="button" @click="removeAlbum">
          Remove this fridge
        </button>
      </article>
      </template>
    </section>

    <section class="recipes-section" aria-labelledby="my-recipes-heading">
      <div class="section-heading">
        <div>
          <h2 id="my-recipes-heading">My published recipes</h2>
        </div>
        <RouterLink class="share-link" to="/share">+ Share a recipe</RouterLink>
      </div>

      <p v-if="!authInitialized" class="recipe-notice" role="status">Checking your sign-in session…</p>
      <section v-else-if="!currentUser" class="empty-recipes">
        <h3>Sign in to see your recipes</h3>
        <p>Your published recipes will appear here, where you can edit or delete them.</p>
        <RouterLink class="share-link" to="/users">Sign in</RouterLink>
        <p v-if="authError" class="recipe-error" role="alert">{{ authError }}</p>
      </section>

      <template v-else>
        <p v-if="loadingRecipes" class="recipe-notice" role="status">Loading your recipes…</p>

        <form v-if="editingRecipeId" class="recipe-editor" @submit.prevent="saveRecipe">
          <div class="editor-heading">
            <h3>Edit recipe</h3>
            <button class="editor-cancel" type="button" @click="cancelEditing">Cancel</button>
          </div>

          <label class="editor-field">
            <span>Recipe name</span>
            <input v-model.trim="recipeForm.title" maxlength="100" required>
          </label>

          <div class="editor-row">
            <label class="editor-field">
              <span>Category</span>
              <input v-model.trim="recipeForm.category" maxlength="100" required>
            </label>
            <label class="editor-field">
              <span>Preparation time (seconds)</span>
              <input v-model="recipeForm.preparation_time" type="number" min="1" step="1">
            </label>
          </div>

          <label class="editor-field">
            <span>Description</span>
            <textarea v-model.trim="recipeForm.description" rows="3"></textarea>
          </label>

          <label class="editor-field">
            <span>Photo URL (optional)</span>
            <input v-model.trim="recipeForm.photo_url" type="text" maxlength="255" placeholder="https://example.com/photo.jpg">
          </label>

          <div class="editor-row">
            <label class="editor-field">
              <span>Glass name (optional)</span>
              <input v-model.trim="recipeForm.glass_name" maxlength="50">
            </label>
            <label class="editor-field">
              <span>Glass capacity (cl, optional)</span>
              <input v-model="recipeForm.capacity_cl" type="number" min="1" step="1">
            </label>
          </div>

          <fieldset class="editor-list">
            <legend>Ingredients</legend>
            <div
              v-for="(item, index) in recipeForm.recipe_ingredients"
              :key="item.rowId"
              class="editor-row editor-list-row"
            >
              <label class="editor-field">
                <span>Ingredient</span>
                <select
                  v-model="item.ingredient_id"
                  required
                  :disabled="ingredients.length === 0"
                >
                  <option value="" disabled>Select an ingredient</option>
                  <option
                    v-for="ingredient in ingredients"
                    :key="ingredient.ingredient_id"
                    :value="ingredient.ingredient_id"
                    :disabled="recipeForm.recipe_ingredients.some(
                      (row, rowIndex) => rowIndex !== index && Number(row.ingredient_id) === ingredient.ingredient_id,
                    )"
                  >
                    {{ ingredient.ingredient_name }}
                  </option>
                </select>
              </label>
              <label class="editor-field editor-quantity">
                <span>Quantity</span>
                <input v-model="item.quantity" type="number" min="0.01" max="999.99" step="0.01" required>
              </label>
              <label class="editor-field editor-unit">
                <span>Unit</span>
                <input v-model.trim="item.unit_of_measure" maxlength="20" required>
              </label>
              <button
                class="editor-remove"
                type="button"
                :disabled="recipeForm.recipe_ingredients.length === 1"
                @click="removeRecipeIngredient(index)"
              >
                Remove
              </button>
            </div>
            <button class="editor-add" type="button" @click="addRecipeIngredient">+ Add ingredient</button>
          </fieldset>

          <fieldset class="editor-list">
            <legend>Preparation steps</legend>
            <div
              v-for="(step, index) in recipeForm.preparation_steps"
              :key="step.rowId"
              class="editor-row editor-list-row"
            >
              <label class="editor-field">
                <span>Step {{ index + 1 }}</span>
                <textarea v-model.trim="step.instruction" rows="2" maxlength="2000" required></textarea>
              </label>
              <button
                class="editor-remove"
                type="button"
                :disabled="recipeForm.preparation_steps.length === 1"
                @click="removePreparationStep(index)"
              >
                Remove
              </button>
            </div>
            <button class="editor-add" type="button" @click="addPreparationStep">+ Add step</button>
          </fieldset>

          <button class="editor-save" type="submit" :disabled="isSavingRecipe">
            {{ isSavingRecipe ? 'Saving…' : 'Save changes' }}
          </button>
        </form>

        <div v-if="!loadingRecipes && myRecipes.length" class="my-recipe-grid">
          <article v-for="recipe in myRecipes" :key="recipe.recipe_id" class="my-recipe-card">
            <img
              v-if="recipe.photo_url?.startsWith('http') && !recipe.photo_url.includes('example.com')"
              class="my-recipe-image"
              :src="recipe.photo_url"
              :alt="recipe.title"
            >
            <div v-else class="my-recipe-image my-recipe-placeholder" aria-hidden="true">Recipe</div>
            <div class="my-recipe-content">
              <p class="my-recipe-category">{{ recipe.category }}</p>
              <h3>{{ recipe.title }}</h3>
              <p>{{ recipe.description || 'No description provided.' }}</p>
              <p class="my-recipe-meta">
                {{ recipe.ingredients.length }} ingredients ·
                {{ recipe.preparationSteps.length }} preparation steps
              </p>
              <div class="my-recipe-actions">
                <button type="button" @click="startEditing(recipe)">Edit</button>
                <button type="button" class="delete-recipe-button" @click="deleteRecipe(recipe)">Delete</button>
              </div>
            </div>
          </article>
        </div>

        <div v-else-if="!loadingRecipes && !myRecipes.length" class="empty-recipes">
          <div class="empty-recipes-art" aria-hidden="true">
            <span>✦</span>
            <span>🍸</span>
            <span>✦</span>
          </div>
          <h3>Your recipes will show up here</h3>
          <p>Once you publish a recipe, you can manage it here.</p>
          <RouterLink class="share-link" to="/share">Share your first recipe</RouterLink>
        </div>
      </template>
    </section>
  </main>
</template>

<style scoped>
.albums-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 48px 6% 80px;
  color: var(--text);
}

.albums-introduction {
  margin-bottom: 48px;
  text-align: center;
}

.albums-introduction h1 {
  margin: 0 0 12px;
  font-family: "Press Start 2P", "Terminal", "Courier New", monospace;
  font-size: clamp(22px, 4vw, 36px);
  line-height: 1.5;
  text-shadow: 3px 3px 0 var(--button);
}

.albums-introduction > p:last-child {
  margin: 0;
  color: var(--nav-text);
}

.album-section,
.recipes-section {
  margin-bottom: 44px;
}

.section-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.section-heading h2 {
  margin: 0;
  font-size: clamp(22px, 3vw, 30px);
}

.album-count {
  padding: 7px 12px;
  border-radius: 20px;
  background-color: var(--surface);
  color: var(--nav-text);
  font-size: 14px;
}

.create-album-form {
  display: flex;
  align-items: flex-end;
  gap: 16px;
  margin-bottom: 28px;
  padding: 20px;
  border-radius: 10px;
  background-color: var(--surface);
  box-shadow: var(--header-shadow);
}

.album-name-field,
.album-color-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-weight: 600;
}

.album-name-field {
  flex: 1;
}

.album-name-field input,
.album-name-field select {
  box-sizing: border-box;
  width: 100%;
  min-height: 44px;
  padding: 9px 12px;
  border: 1px solid var(--nav-text);
  border-radius: 6px;
  background-color: var(--page-bg);
  color: var(--text);
  font: inherit;
}

.album-color-field input {
  width: 54px;
  height: 44px;
  padding: 3px;
  border: 1px solid var(--nav-text);
  border-radius: 6px;
  background-color: var(--page-bg);
  cursor: pointer;
}

.create-album-button,
.remove-button {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  justify-content: center;
  padding: 10px 18px;
  border: 1px solid var(--button);
  border-radius: 6px;
  background-color: var(--button);
  color: #ffffff;
  font: inherit;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}
.remove-button {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  justify-content: center;
  padding: 10px 18px;
  border: 1px solid var(--button);
  border-radius: 6px;
  background-color: var(--button);
  color: #ffffff;
  font: inherit;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.create-album-button:hover,
.remove-button:hover {
  border-color: var(--button-hover);
  background-color: var(--button-hover);
  color: var(--text);
}

.create-album-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.fridge-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 24px;
  padding: 8px 0;
}

.fridge-card {
  position: relative;
  display: flex;
  min-height: 218px;
  flex-direction: column;
  padding: 10px 16px 14px;
  border: 3px solid color-mix(in srgb, var(--fridge-color), #000 12%);
  border-radius: 18px 18px 14px 14px;
  background: linear-gradient(110deg, color-mix(in srgb, var(--fridge-color), #fff 18%), var(--fridge-color) 45%, color-mix(in srgb, var(--fridge-color), #000 7%));
  box-shadow: 0 7px 0 color-mix(in srgb, var(--fridge-color), #000 24%), 0 12px 20px rgb(0 0 0 / 12%);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.fridge-card:hover,
.fridge-card-selected {
  transform: translateY(-4px);
  box-shadow: 0 10px 0 color-mix(in srgb, var(--fridge-color), #000 24%), 0 16px 24px rgb(0 0 0 / 14%);
}

.fridge-top,
.fridge-bottom {
  position: relative;
  display: block;
  border: 1px solid rgb(0 0 0 / 12%);
  background: rgb(255 255 255 / 13%);
}

.fridge-top {
  height: 67px;
  border-radius: 8px 8px 3px 3px;
}

.fridge-bottom {
  flex: 1;
  margin-top: 5px;
  border-radius: 3px 3px 9px 9px;
}

.fridge-freezer {
  position: absolute;
  top: 11px;
  right: 12px;
  left: 12px;
  border-top: 1px solid rgb(255 255 255 / 35%);
}

.fridge-handle {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 5px;
  height: 42px;
  border-radius: 5px;
  background: rgb(255 255 255 / 80%);
  box-shadow: 1px 1px 2px rgb(0 0 0 / 20%);
}

.fridge-bottom .fridge-handle {
  top: 14px;
  height: 52px;
}

.fridge-magnet {
  position: absolute;
  width: 13px;
  height: 13px;
  border: 2px solid rgb(255 255 255 / 90%);
  border-radius: 50%;
  box-shadow: 0 1px 2px rgb(0 0 0 / 18%);
}

.fridge-magnet-one {
  top: 18px;
  left: 20px;
}

.fridge-magnet-two {
  top: 44px;
  left: 40px;
  width: 10px;
  height: 10px;
}

.fridge-label {
  overflow: hidden;
  margin-top: 15px;
  color: #202020;
  font-weight: 700;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty-fridges,
.empty-recipes,
.selected-album {
  padding: 28px;
  border: 1px dashed color-mix(in srgb, var(--nav-text), transparent 55%);
  border-radius: 12px;
  background-color: var(--surface);
  text-align: center;
}

.empty-fridge-icon {
  display: block;
  color: var(--button);
  font-size: 48px;
  line-height: 1;
}

.empty-fridges p {
  margin: 10px 0 0;
  color: var(--nav-text);
}

.empty-fridges p:first-of-type {
  color: var(--text);
  font-weight: 700;
}

.selected-album {
  margin-top: 28px;
  border-style: solid;
  text-align: left;
}

.selected-album-heading {
  display: flex;
  align-items: center;
  gap: 12px;
}

.selected-album-heading h3 {
  margin: 0;
}

.selected-album-swatch {
  width: 20px;
  height: 20px;
  border: 1px solid rgb(0 0 0 / 15%);
  border-radius: 50%;
}

.selected-album > p {
  margin: 12px 0;
  color: var(--nav-text);
}

.share-link {
  padding: 10px 16px;
  border: 1px solid var(--button);
  border-radius: 6px;
  color: var(--button);
  font-weight: 600;
  text-decoration: none;
}

.share-link:hover {
  background-color: var(--button);
  color: #ffffff;
}

.empty-recipes {
  padding: 36px 24px;
}

.empty-recipes-art {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 12px;
  color: var(--button);
  font-size: 20px;
}

.empty-recipes-art span:nth-child(2) {
  font-size: 42px;
}

.empty-recipes h3 {
  margin: 0 0 10px;
  font-size: 21px;
}

.empty-recipes p {
  max-width: 520px;
  margin: 0 auto 20px;
  color: var(--nav-text);
  line-height: 1.6;
}

.recipe-notice {
  margin: 0 0 16px;
  padding: 14px 18px;
  border-radius: 8px;
  background-color: var(--surface);
  color: var(--nav-text);
}

.recipe-error {
  border: 1px solid #b42318;
  color: #b42318;
}

.recipe-success {
  border: 1px solid #16803c;
  color: #16803c;
}

.my-recipe-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.my-recipe-card {
  overflow: hidden;
  border-radius: 10px;
  background-color: var(--surface);
  box-shadow: var(--header-shadow);
}

.my-recipe-image {
  display: grid;
  width: 100%;
  height: 190px;
  object-fit: cover;
  place-items: center;
  background-color: color-mix(in srgb, var(--page-bg), var(--surface) 30%);
  color: var(--nav-text);
}

.my-recipe-content {
  padding: 18px;
}

.my-recipe-category,
.my-recipe-meta {
  color: var(--nav-text);
  font-size: 13px;
}

.my-recipe-category {
  margin: 0 0 6px;
  color: var(--button);
  font-weight: 700;
}

.my-recipe-content h3 {
  margin: 0 0 10px;
}

.my-recipe-content > p:not(.my-recipe-category):not(.my-recipe-meta) {
  min-height: 42px;
  margin: 0 0 12px;
  color: var(--nav-text);
  line-height: 1.5;
}

.my-recipe-meta {
  margin: 0 0 16px;
}

.my-recipe-actions {
  display: flex;
  gap: 10px;
}

.my-recipe-actions button,
.editor-save,
.editor-add,
.editor-remove,
.editor-cancel {
  padding: 9px 14px;
  border: 1px solid var(--button);
  border-radius: 6px;
  background-color: var(--button);
  color: #ffffff;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.my-recipe-actions button:hover,
.editor-save:hover:not(:disabled),
.editor-add:hover,
.editor-remove:hover:not(:disabled),
.editor-cancel:hover {
  border-color: var(--button-hover);
  background-color: var(--button-hover);
  color: var(--text);
}

.my-recipe-actions .delete-recipe-button {
  border-color: #b42318;
  background-color: transparent;
  color: #b42318;
}

.my-recipe-actions .delete-recipe-button:hover {
  background-color: #b42318;
  color: #ffffff;
}

.recipe-editor {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
  padding: 24px;
  border-radius: 10px;
  background-color: var(--surface);
  box-shadow: var(--header-shadow);
}

.editor-heading,
.editor-row {
  display: flex;
  align-items: flex-end;
  gap: 14px;
}

.editor-heading {
  align-items: center;
  justify-content: space-between;
}

.editor-heading h3 {
  margin: 0;
  color: var(--button);
}

.editor-field {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 7px;
}

.editor-field span,
.editor-list legend {
  font-weight: 600;
}

.editor-field input,
.editor-field select,
.editor-field textarea {
  box-sizing: border-box;
  width: 100%;
  min-height: 40px;
  padding: 9px 11px;
  border: 1px solid color-mix(in srgb, var(--nav-text) 45%, transparent);
  border-radius: 6px;
  background-color: var(--page-bg);
  color: var(--text);
  font: inherit;
}

.editor-quantity,
.editor-unit {
  flex: 0 1 130px;
}

.editor-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
  margin: 0;
  padding: 16px;
  border: 1px solid color-mix(in srgb, var(--nav-text) 30%, transparent);
  border-radius: 8px;
}

.editor-list legend {
  padding: 0 6px;
  color: var(--button);
}

.editor-list-row {
  width: 100%;
}

.editor-add,
.editor-cancel {
  align-self: flex-start;
  background-color: transparent;
  color: var(--button);
}

.editor-remove {
  border-color: color-mix(in srgb, var(--nav-text) 35%, transparent);
  background-color: transparent;
  color: var(--nav-text);
}

.editor-remove:disabled,
.editor-save:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.editor-save {
  align-self: flex-start;
}

@media (max-width: 600px) {
  .albums-page {
    padding-top: 32px;
  }

  .create-album-form {
    flex-wrap: wrap;
  }

  .album-name-field {
    flex-basis: 100%;
  }

  .create-album-button {
    flex: 1;
  }

  .section-heading {
    align-items: flex-start;
  }

  .editor-row {
    align-items: stretch;
    flex-direction: column;
  }

  .editor-quantity,
  .editor-unit {
    flex-basis: auto;
  }
}
</style>
