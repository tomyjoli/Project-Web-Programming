<script setup>
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'

const albums = ref([])
const albumName = ref('')
const albumColor = ref('#f4a261')
const selectedAlbumId = ref(null)
const selectedAlbum = computed(() => (
  albums.value.find((album) => album.id === selectedAlbumId.value) ?? null
))
let nextAlbumId = 1

function createAlbum() {
  const name = albumName.value.trim()
  if (!name) return

  const album = {
    id: nextAlbumId++,
    name,
    color: albumColor.value,
  }

  albums.value.push(album)
  selectedAlbumId.value = album.id
  albumName.value = ''
}

function removeAlbum() {
  if (!selectedAlbumId.value) return
  const index = albums.value.findIndex((album) => album.id === selectedAlbumId.value)
  if (index !== -1) {
    albums.value.splice(index, 1)
    selectedAlbumId.value = null
  }
}

function openAlbum(album) {
  selectedAlbumId.value = selectedAlbumId.value === album.id ? null : album.id
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
          :key="album.id"
          class="fridge-card"
          :class="{ 'fridge-card-selected': selectedAlbumId === album.id }"
          :style="{ '--fridge-color': album.color }"
          type="button"
          :aria-pressed="selectedAlbumId === album.id"
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
        <p>Recipes you add to this fridge will be waiting here.</p>
        <button class="remove-button" type="button" @click="removeAlbum">
          Remove this fridge
        </button>
      </article>
    </section>

    <section class="recipes-section" aria-labelledby="my-recipes-heading">
      <div class="section-heading">
        <div>
          <h2 id="my-recipes-heading">My shared recipes</h2>
        </div>
        <RouterLink class="share-link" to="/share">+ Share a recipe</RouterLink>
      </div>

      <div class="empty-recipes">
        <div class="empty-recipes-art" aria-hidden="true">
          <span>✦</span>
          <span>🍸</span>
          <span>✦</span>
        </div>
        <h3>Your recipes will show up here</h3>
        <p>Once you share a recipe, you’ll find it here and be able to add it to your fridges.</p>
      </div>
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

.album-name-field input {
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
}
</style>
