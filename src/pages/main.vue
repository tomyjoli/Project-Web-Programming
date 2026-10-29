<script setup>
import { RouterLink } from 'vue-router'
import backgroundVideo from '../assets/fond_page_accueil.mp4'
import presentationImage from '../assets/mojito.jpg'
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
      </div>
    </section>

    <section class="presentation">
      <img
        class="presentation-image"
        :src="presentationImage"
        alt="A freshly prepared mojito"
      >

      <div class="presentation-text">
        <h2>Discover, create, and share recipes</h2>
        <p class="presentation-tagline">
          Find inspiration for your next drink, one recipe at a time.
        </p>
        <p>
          Banana Split is a place to explore recipes, discover the ingredients
          that go into them, and share your own creations. Whether you are
          looking for a new favorite or ready to publish a recipe, everything
          starts here.
        </p>
        <RouterLink class="presentation-button" to="/recipes">
          Explore the recipes
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

.presentation {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  align-items: center;
  gap: 48px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 80px 6%;
  color: var(--text);
}

.presentation-image {
  display: block;
  width: 100%;
  height: 360px;
  border-radius: 10px;
  object-fit: cover;
  box-shadow: var(--header-shadow);
}

.presentation-text h2 {
  margin: 0 0 16px;
  font-size: clamp(26px, 3vw, 36px);
}

.presentation-tagline {
  margin: 0 0 16px;
  color: var(--button);
  font-size: 19px;
  font-weight: 600;
}

.presentation-text > p:not(.presentation-tagline) {
  margin: 0;
  color: var(--nav-text);
  line-height: 1.7;
}

.presentation-button {
  display: inline-block;
  margin-top: 24px;
  padding: 12px 20px;
  border-radius: 6px;
  background-color: var(--button);
  color: #ffffff;
  font-weight: 600;
  text-decoration: none;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.presentation-button:hover {
  background-color: var(--button-hover);
  color: var(--text);
}
</style>