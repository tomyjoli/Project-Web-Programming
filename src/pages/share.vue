<template>
  <main class="share-page">
    <section class="share-introduction">
      <h1>Share your recipe</h1>
      <p>Have a cocktail worth sharing? Add its details below.</p>
    </section>

    <form class="share-form">
      <section class="form-section">
        <h2>Recipe details</h2>

        <label class="form-field">
          <span>Recipe name</span>
          <input type="text" placeholder="e.g. Summer Berry Cooler">
        </label>

        <div class="form-row">
          <label class="form-field">
            <span>Category</span>
            <input type="text" placeholder="e.g. Cocktail, Milkshake">
          </label>

          <label class="form-field">
            <span>Preparation time (minutes)</span>
            <input type="number" min="1" placeholder="5">
          </label>
        </div>

        <label class="form-field">
          <span>Description</span>
          <textarea rows="3" placeholder="Describe your recipe"></textarea>
        </label>

        <label class="form-field">
          <span>Photo URL</span>
          <input type="url" placeholder="https://example.com/your-recipe.jpg">
        </label>

        <div class="form-row">
          <label class="form-field">
            <span>Glass name</span>
            <input type="text" placeholder="e.g. Highball">
          </label>

          <label class="form-field">
            <span>Glass capacity (cl)</span>
            <input type="number" min="1" placeholder="30">
          </label>
        </div>
      </section>

      <section class="form-section">
        <h2>Ingredients</h2>

        <div class="ingredient-row">
          <label class="form-field">
            <span>Ingredient</span>
            <select>
              <option value="">Select an ingredient</option>
              <option>Vodka</option>
              <option>White rum</option>
              <option>Pineapple juice</option>
              <option>Grenadine</option>
              <option>Lime juice</option>
              <option>Milk</option>
              <option>Strawberries</option>
              <option>Raspberries</option>
              <option>Blueberries</option>
            </select>
          </label>

          <label class="form-field">
            <span>Quantity</span>
            <input type="number" min="0" step="0.01" placeholder="4">
          </label>

          <label class="form-field">
            <span>Unit</span>
            <input type="text" placeholder="cl">
          </label>
        </div>

        <button class="secondary-button" type="button">+ Add ingredient</button>
      </section>

      <section class="form-section">
        <h2>Preparation</h2>

        <label class="form-field">
          <span>Step 1</span>
          <textarea rows="3" placeholder="Describe the first step"></textarea>
        </label>

        <button class="secondary-button" type="button">+ Add step</button>
      </section>

      <button class="share-button" type="button">Share recipe</button>
    </form>
  </main>
</template>

<style scoped>
.share-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 48px 6%;
  color: var(--text);
}

.share-introduction {
  margin-bottom: 32px;
  text-align: center;
}

.share-introduction h1 {
  margin: 0 0 12px;
}

.share-introduction p {
  margin: 0;
  color: var(--nav-text);
}

.share-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 24px;
  border-radius: 10px;
  background-color: var(--surface);
  box-shadow: var(--header-shadow);
}

.form-section h2 {
  margin: 0;
  color: var(--button);
  font-size: 22px;
}

.form-row,
.ingredient-row {
  display: flex;
  gap: 16px;
}

.form-field {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 8px;
}

.form-field span {
  font-weight: 600;
}

.form-field input,
.form-field select,
.form-field textarea {
  box-sizing: border-box;
  width: 100%;
  padding: 11px 12px;
  border: 1px solid var(--nav-text);
  border-radius: 6px;
  background-color: var(--page-bg);
  color: var(--text);
  font: inherit;
}

.secondary-button,
.share-button {
  align-self: flex-start;
  padding: 11px 18px;
  border: 1px solid var(--button);
  border-radius: 6px;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.secondary-button {
  background-color: transparent;
  color: var(--button);
}

.share-button {
  background-color: var(--button);
  color: #ffffff;
}

.secondary-button:hover,
.share-button:hover {
  border-color: var(--button-hover);
  background-color: var(--button-hover);
  color: var(--text);
}
</style>
