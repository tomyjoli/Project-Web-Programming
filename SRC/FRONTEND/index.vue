<template>
  <main class="site-shell">
    <header class="topbar">
      <a class="brand" href="#top" aria-label="Banana Split, accueil">
        <span class="brand-mark" aria-hidden="true">B</span>
        <span>Banana Split</span>
      </a>
      <nav class="navigation" aria-label="Navigation principale">
        <a class="active" href="#top">Accueil</a>
        <a href="#search">Rechercher</a>
        <a href="#trending">Tendance</a>
      </nav>
      <button class="profile-button" type="button">S'inscrire</button>
    </header>

    <section id="top" class="hero-section">
      <video class="hero-video" autoplay muted loop playsinline aria-hidden="true">
        <source :src="cocktailVideo" type="video/mp4" />
      </video>
      <div class="hero-overlay"></div>
      <div class="hero-copy">
        <p class="eyebrow">Cocktails made personal</p>
        <h1>Your next favorite drink is already in your kitchen.</h1>
        <p class="hero-text">Find a cocktail from the ingredients you already have.</p>
        <a class="hero-link" href="#search">Explore recipes</a>
      </div>
    </section>

    <section id="search" class="search-section">
      <p class="eyebrow">Find your next pour</p>
      <h2>Search a cocktail</h2>
      <p class="section-copy">Search by cocktail title, ingredient or community member.</p>
      <label class="search-bar" for="recipe-search">
        <span aria-hidden="true">⌕</span>
        <input id="recipe-search" v-model="searchQuery" type="search" placeholder="Vodka, pineapple, Tom..." />
        <button v-if="searchQuery" type="button" @click="searchQuery = ''">Clear</button>
      </label>
    </section>

    <section id="trending" class="trending-section">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Made by the community</p>
          <h2>Drinks of the moment</h2>
        </div>
        <span class="recipe-count">{{ filteredRecipes.length }} recipes</span>
      </div>
      <div v-if="filteredRecipes.length" class="recipe-grid">
        <article v-for="recipe in filteredRecipes" :key="recipe.recipe_id" class="recipe-card">
          <div class="recipe-art">
            <img :src="recipe.image" :alt="recipe.title" />
            <span class="recipe-rating">{{ recipe.rating }}/5</span>
          </div>
          <div class="recipe-body">
            <div class="recipe-meta"><span>Cocktail</span><span>By {{ recipe.author }}</span></div>
            <h3>{{ recipe.title }}</h3>
            <p>{{ recipe.description }}</p>
            <div class="recipe-specs"><span>{{ recipe.glass_name }}</span><span>{{ recipe.capacity_cl }} cl</span><span>{{ recipe.preparationTime }}</span></div>
            <p class="recipe-ingredients">{{ recipe.ingredients.join(' · ') || 'Ingredients to discover' }}</p>
          </div>
        </article>
      </div>
      <p v-else class="empty-state">No cocktail matches your search.</p>
    </section>
  </main>
</template>

<script setup>
import { computed, ref } from 'vue'
import cocktailData from '../../bananasplit.json'
import cocktailVideo from '../Images/4K Free Stock Footage Halloween Cocktail in Dark Bar with Dramatic Red Light.mp4'
import fiveIngredientPunchImage from '../Images/Five_Ingredient_Punch.jpg'
import limeGrenadineFizzImage from '../Images/lime_grenadine_fizz.jpg'
import pineappleVodkaImage from '../Images/pineapple_vodka.jpg'
import rumSunriseImage from '../Images/rum_sunrise.jpg'
import tropicalRumCoolerImage from '../Images/Tropical_Rum_Cooler.jpg'

const searchQuery = ref('')
const data = cocktailData && typeof cocktailData === 'object' ? cocktailData : {}
const users = Array.isArray(data.users) ? data.users : []
const ingredients = Array.isArray(data.ingredients) ? data.ingredients : []
const sourceRecipes = Array.isArray(data.recipes) ? data.recipes : []
const recipeIngredients = Array.isArray(data.recipe_ingredients) ? data.recipe_ingredients : []
const reviews = Array.isArray(data.reviews) ? data.reviews : []
const imageById = { 1: pineappleVodkaImage, 2: rumSunriseImage, 3: limeGrenadineFizzImage, 4: tropicalRumCoolerImage, 5: fiveIngredientPunchImage }

const recipes = sourceRecipes.map((recipe) => {
  const author = users.find((user) => user.user_id === recipe.user_id)?.username || 'Community'
  const names = recipeIngredients
    .filter((item) => item.recipe_id === recipe.recipe_id)
    .map((item) => ingredients.find((ingredient) => ingredient.ingredient_id === item.ingredient_id)?.ingredient_name)
    .filter(Boolean)
  const recipeReviews = reviews.filter((review) => review.recipe_id === recipe.recipe_id)
  const average = recipeReviews.length ? recipeReviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / recipeReviews.length : 0
  const seconds = Number(recipe.preparation_time || 0)

  return {
    ...recipe,
    author,
    ingredients: names,
    rating: average.toFixed(1),
    preparationTime: seconds ? `${Math.ceil(seconds / 60)} min` : 'Quick',
    image: imageById[recipe.recipe_id] || pineappleVodkaImage,
  }
})

const filteredRecipes = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return recipes
  return recipes.filter((recipe) => [recipe.title, recipe.description, recipe.author, ...recipe.ingredients].join(' ').toLowerCase().includes(query))
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@500;600;700;800&family=Playfair+Display:wght@600;700&display=swap');
:root { --ink: #2c1b15; --muted: #806b61; --paper: #fff6ed; --line: #f0d4c1; --orange: #e76532; --cream: #fffaf5; }
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { margin: 0; background: var(--paper); color: var(--ink); font-family: 'DM Sans', sans-serif; }
button, input { font: inherit; }
.site-shell { max-width: 1180px; margin: 0 auto; padding: 0 30px; }
.topbar { display: flex; height: 84px; align-items: center; justify-content: space-between; border-bottom: 2px solid var(--line); }
.brand { display: flex; align-items: center; gap: 10px; color: var(--ink); font-family: 'Playfair Display', serif; font-size: 21px; text-decoration: none; }
.brand-mark { display: grid; width: 34px; height: 34px; place-items: center; border: 2px solid var(--ink); border-radius: 50%; background: rgb(255, 197, 0); font-family: 'DM Sans', sans-serif; font-size: 18px; font-weight: 800; }
.navigation { display: flex; gap: 28px; }
.navigation a { color: var(--muted); font-size: 12px; text-decoration: none; }
.navigation a:hover, .navigation a.active { color: var(--orange); font-weight: 700; }
.profile-button { padding: 10px 16px; border: 2px solid var(--ink); border-radius: 12px; background: rgb(255, 197, 0); color: var(--ink); cursor: pointer; font-size: 12px; font-weight: 800; }
.hero-section { position: relative; display: grid; width: 100vw; min-height: calc(100svh - 84px); margin-left: calc(50% - 50vw); place-items: center; overflow: hidden; isolation: isolate; }
.hero-video, .hero-overlay { position: absolute; inset: 0; width: 100%; height: 100%; }
.hero-video { z-index: -2; object-fit: cover; object-position: center; }
.hero-overlay { z-index: -1; background: rgba(44, 27, 21, .58); }
.hero-copy { max-width: 720px; padding: 40px 30px; color: white; text-align: center; }
.eyebrow { margin: 0 0 14px; color: var(--orange); font-size: 11px; font-weight: 800; letter-spacing: .13em; text-transform: uppercase; }
.hero-copy .eyebrow { color: #ffd38a; }
.hero-copy h1 { margin: 0 0 22px; font-family: 'Playfair Display', serif; font-size: clamp(42px, 6vw, 74px); line-height: .98; }
.hero-text { margin: 0 auto 28px; color: #fff4e8; font-size: 15px; }
.hero-link { display: inline-block; padding: 13px 18px; border-radius: 10px; background: rgb(255, 197, 0); color: var(--ink); font-size: 12px; font-weight: 800; text-decoration: none; }
.search-section, .trending-section { padding: 82px 0; }
.search-section { max-width: 760px; margin: 0 auto; text-align: center; }
.search-section h2, .section-heading h2 { margin: 0; font-family: 'Playfair Display', serif; font-size: clamp(34px, 5vw, 52px); line-height: 1; }
.section-copy { margin: 18px auto 28px; color: var(--muted); font-size: 14px; }
.search-bar { display: flex; max-width: 680px; align-items: center; gap: 8px; margin: 0 auto; padding: 7px; border: 3px solid var(--ink); border-radius: 18px; background: white; box-shadow: 5px 6px 0 var(--orange); text-align: left; }
.search-bar span { padding-left: 10px; color: var(--orange); font-size: 24px; }
.search-bar input { width: 100%; min-width: 0; border: 0; outline: 0; padding: 10px; color: var(--ink); font-size: 13px; }
.search-bar button { padding: 9px 12px; border: 2px solid var(--ink); border-radius: 9px; background: rgb(255, 197, 0); color: var(--ink); cursor: pointer; font-size: 11px; font-weight: 800; }
.trending-section { border-top: 2px solid var(--line); }
.section-heading { display: flex; align-items: end; justify-content: space-between; margin-bottom: 25px; }
.recipe-count { color: var(--muted); font-size: 12px; }
.recipe-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.recipe-card { overflow: hidden; border: 3px solid var(--ink); border-radius: 16px; background: var(--cream); box-shadow: 5px 6px 0 #f5a06e; }
.recipe-art { position: relative; height: 195px; overflow: hidden; background: #ffd8a5; }
.recipe-art img { width: 100%; height: 100%; object-fit: contain; background: #fff6ed; }
.recipe-rating { position: absolute; top: 12px; right: 12px; padding: 6px 8px; border: 2px solid var(--ink); border-radius: 9px; background: var(--cream); font-size: 10px; font-weight: 800; }
.recipe-body { padding: 18px; }
.recipe-meta { display: flex; justify-content: space-between; margin-bottom: 10px; color: var(--orange); font-size: 10px; font-weight: 800; text-transform: uppercase; }
.recipe-meta span:last-child { color: var(--muted); text-transform: none; }
.recipe-body h3 { margin: 0 0 7px; font-family: 'Playfair Display', serif; font-size: 22px; }
.recipe-body p { min-height: 38px; margin: 0 0 16px; color: var(--muted); font-size: 12px; line-height: 1.45; }
.recipe-specs { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
.recipe-specs span { padding: 4px 6px; border: 1px solid var(--line); border-radius: 6px; color: var(--muted); font-size: 10px; }
.recipe-ingredients { min-height: 30px; color: var(--orange) !important; font-size: 11px !important; font-weight: 700; }
.empty-state { padding: 35px; border: 2px dashed var(--line); color: var(--muted); text-align: center; }
@media (max-width: 760px) { .site-shell { padding: 0 20px; }.topbar { height: 70px; }.navigation { gap: 12px; }.navigation a { font-size: 11px; }.hero-section { min-height: calc(100svh - 70px); }.search-section, .trending-section { padding: 58px 0; }.section-heading { align-items: start; flex-direction: column; gap: 12px; }.recipe-grid { grid-template-columns: 1fr; }.recipe-card { width: 100%; } }
</style>
