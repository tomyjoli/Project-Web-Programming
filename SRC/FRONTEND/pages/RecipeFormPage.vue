<template>
    <section class="detail-page form-page">
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
</template>

<script setup>
import { inject } from 'vue'
const { openSharePage, recipeForm, handlePhotoChange, photoError, removeIngredient, addIngredient, removeStep, addStep, formError, editingRecipeId, saveOwnedRecipe } = inject('page-context')
</script>
