<script setup>
import { RouterLink } from 'vue-router'
import backgroundVideo from '../assets/fond_page_accueil.mp4'
</script>

<template>
  <main>
    <section class="main_first_section">
      <video class="main_first_section_video" autoplay muted loop playsinline aria-hidden="true">
        <source :src="backgroundVideo" type="video/mp4">
      </video>

      <div class="main_first_section_content">
        <h1>
          Your next
          <br>
          favorite cocktail
          <br>
          starts here.
        </h1>
        <RouterLink class="search-recipes-button" to="/recipes">
        Search for recipes
        </RouterLink>
      </div>
    </section>
  </main>
</template>

<style scoped>
.main_first_section {
  position: relative;
  height: 90vh;
}

.main_first_section_video {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.main_first_section_content {
  position: absolute;
  top: 20%;
  left: 8%;
  color: #ffffff;
}

.main_first_section_content h1 {
  display: table;
  margin: 0;
  padding: 8px 12px;
  color: #ffffff;
  font-size: 48px;
  font-family: "Kermit Semibold", sans-serif;
  font-weight: 600;
  line-height: 1.2;
  text-shadow: 0 2px 8px var(--button);
}

.search-recipes-button {
  display: inline-block;
  margin-top: 24px;
  padding: 12px 20px;
  border: 2px solid var(--button-fixed);
  border-radius: 6px;
  background-color: transparent;
  color: #ffffff;
  font-weight: 600;
  text-decoration: none;
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
}

.search-recipes-button:hover {
  background-color: var(--button-hover);
  border-color: var(--button-hover);
  color: var(--text);
}
</style>