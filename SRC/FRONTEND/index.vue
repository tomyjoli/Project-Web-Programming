<template>
  <main class="page-shell">
    <header class="topbar">
      <a class="brand" href="#top" aria-label="Banana Split, home">
        <span class="brand-mark">BS</span>
        <span>Banana Split</span>
      </a>
      <nav class="navigation" aria-label="Main navigation">
        <a class="active" href="#discover">Discover</a>
        <a href="#popular">Popular</a>
        <a href="#share">Share a recipe</a>
      </nav>
      <button class="profile-button" type="button" aria-label="Open profile">TG</button>
    </header>

    <section id="top" class="hero-section">
      <div class="hero-copy">
        <p class="eyebrow">Your bar, your rules</p>
        <h1>The right cocktail starts with what you already have.</h1>
        <p class="hero-description">
          Find a recipe, improvise with your ingredients and share your best creations.
        </p>
        <form class="search-bar" @submit.prevent="searchRecipes">
          <span class="search-icon" aria-hidden="true">⌕</span>
          <input v-model="searchQuery" type="search" placeholder="E.g. rum, lemon, mint..." aria-label="Search recipes" />
          <button type="submit">Search</button>
        </form>
        <div class="quick-searches" aria-label="Quick searches">
          <span>Try:</span>
          <button v-for="suggestion in suggestions" :key="suggestion" type="button" @click="searchQuery = suggestion; searchRecipes()">
            {{ suggestion }}
          </button>
        </div>
      </div>
      <div class="hero-visual" aria-label="Fresh cocktail served in a glass">
        <div class="sun-disc"></div>
        <div class="fruit fruit-one">🍊</div>
        <div class="fruit fruit-two">🍋</div>
        <div class="glass-shadow"></div>
        <div class="cocktail-glass">
          <div class="drink"></div>
          <div class="ice ice-one"></div>
          <div class="ice ice-two"></div>
          <div class="straw"></div>
          <div class="garnish">🍒</div>
        </div>
        <p class="visual-note">Fresh, simple, homemade.</p>
      </div>
    </section>

    <section id="discover" class="content-section">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Set the mood</p>
          <h2>What are you mixing today?</h2>
        </div>
        <a href="#popular" class="text-link">View all recipes <span aria-hidden="true">→</span></a>
      </div>
      <div class="mood-grid">
        <button v-for="mood in moods" :key="mood.label" class="mood-card" :class="mood.className" type="button" @click="searchQuery = mood.search; searchRecipes()">
          <span class="mood-icon">{{ mood.icon }}</span>
          <span class="mood-label">{{ mood.label }}</span>
          <span class="mood-count">{{ mood.count }} recipes</span>
        </button>
      </div>
    </section>

    <section id="popular" class="content-section recipes-section">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Community favorites</p>
          <h2>What people are sipping</h2>
        </div>
        <button class="filter-button" type="button" @click="showEasyOnly = !showEasyOnly">
          {{ showEasyOnly ? 'All recipes' : 'Easy recipes' }} <span aria-hidden="true">⌄</span>
        </button>
      </div>
      <div class="recipe-grid">
        <article v-for="recipe in filteredRecipes" :key="recipe.name" class="recipe-card">
          <div class="recipe-image" :class="recipe.colorClass"><span>{{ recipe.emoji }}</span><span class="rating">★ {{ recipe.rating }}</span></div>
          <div class="recipe-details">
            <div class="recipe-meta"><span>{{ recipe.type }}</span><span>{{ recipe.time }}</span></div>
            <h3>{{ recipe.name }}</h3>
            <p>{{ recipe.description }}</p>
            <div class="recipe-footer"><span>{{ recipe.author }}</span><button type="button" aria-label="Add to favorites">♡</button></div>
          </div>
        </article>
      </div>
      <p v-if="filteredRecipes.length === 0" class="empty-state">No recipes match your search.</p>
    </section>

    <section id="share" class="share-banner">
      <div>
        <p class="eyebrow">Your turn</p>
        <h2>Have a mix you are proud of?</h2>
        <p>Publish your recipe and inspire the next happy hour.</p>
      </div>
      <button class="primary-button" type="button">Share a recipe <span aria-hidden="true">↗</span></button>
    </section>

    <footer class="footer"><span>Banana Split © 2024</span><span>Made for the curious and the good times.</span></footer>
  </main>
</template>

<script setup>
import { computed, ref } from 'vue'

const searchQuery = ref('')
const showEasyOnly = ref(false)
const suggestions = ['Mojito', 'Virgin', 'Pineapple']

const moods = [
  { label: 'Fresh & fruity', count: 48, icon: '✦', className: 'mood-mint', search: 'fruit' },
  { label: 'Sweet & smooth', count: 32, icon: '◒', className: 'mood-peach', search: 'sweet' },
  { label: 'Zero-proof', count: 27, icon: '◌', className: 'mood-lilac', search: 'virgin' },
  { label: 'Quick to make', count: 19, icon: 'ϟ', className: 'mood-yellow', search: 'quick' },
]

const recipes = [
  { name: 'Sunset Passion', type: 'Fruity', time: '5 min', rating: '4.9', author: 'Lea M.', emoji: '🍹', colorClass: 'image-coral', description: 'A sunny balance of passion fruit and citrus.', easy: true },
  { name: 'Green Garden', type: 'Fresh', time: '8 min', rating: '4.8', author: 'Nicolas R.', emoji: '🥒', colorClass: 'image-green', description: 'Cucumber, basil and lime for a little reset.', easy: true },
  { name: 'Velvet Berry', type: 'Smooth', time: '10 min', rating: '4.7', author: 'Sarah K.', emoji: '🍓', colorClass: 'image-berry', description: 'Bright berries finished with a touch of vanilla.', easy: false },
]

const filteredRecipes = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  return recipes.filter((recipe) => {
    const matchesQuery = !query || `${recipe.name} ${recipe.type} ${recipe.description}`.toLowerCase().includes(query)
    return matchesQuery && (!showEasyOnly.value || recipe.easy)
  })
})

function searchRecipes() {
  document.querySelector('#popular')?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap');

:root { --ink: #2c1b15; --muted: #806b61; --paper: #fff8f1; --line: #f0ddd0; --lime: #ffd38a; --coral: #e76532; --orange: #f28a42; }
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { margin: 0; background: var(--paper); color: var(--ink); font-family: 'DM Sans', sans-serif; }
button, input { font: inherit; }
button, a { -webkit-tap-highlight-color: transparent; }
.page-shell { max-width: 1280px; margin: 0 auto; padding: 0 42px; overflow: hidden; }
.topbar { height: 86px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--line); }
.brand { display: flex; align-items: center; gap: 10px; color: var(--ink); font-weight: 700; text-decoration: none; letter-spacing: -.03em; }
.brand-mark { display: grid; width: 32px; height: 32px; place-items: center; border-radius: 50%; background: var(--coral); color: #fff8f1; font-size: 11px; letter-spacing: 0; }
.navigation { display: flex; gap: 33px; margin-left: 100px; }
.navigation a { position: relative; color: var(--muted); text-decoration: none; font-size: 13px; }
.navigation a.active, .navigation a:hover { color: var(--ink); }
.navigation a.active::after { position: absolute; right: 0; bottom: -11px; left: 0; height: 2px; background: var(--coral); content: ''; }
.profile-button { width: 34px; height: 34px; border: 0; border-radius: 50%; background: #ffe0bd; color: #a34825; font-size: 11px; font-weight: 700; }
.hero-section { display: grid; grid-template-columns: 1fr .9fr; min-height: 475px; align-items: center; gap: 40px; padding: 64px 0 52px; }
.eyebrow { margin: 0 0 13px; color: var(--coral); font-size: 11px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
h1, h2, h3, p { margin-top: 0; } h1, h2 { font-family: 'Playfair Display', serif; letter-spacing: -.045em; }
h1 { max-width: 610px; margin-bottom: 20px; font-size: clamp(45px, 5vw, 72px); line-height: .98; }
.hero-description { max-width: 405px; margin-bottom: 29px; color: var(--muted); font-size: 15px; line-height: 1.65; }
.search-bar { display: flex; max-width: 520px; align-items: center; padding: 5px 6px 5px 16px; border: 1px solid var(--line); border-radius: 6px; background: white; box-shadow: 0 12px 32px rgba(55, 65, 46, .06); }
.search-icon { margin-right: 9px; color: var(--coral); font-size: 25px; line-height: 1; transform: rotate(-20deg); }
.search-bar input { width: 100%; border: 0; outline: 0; color: var(--ink); font-size: 13px; }
.search-bar button, .primary-button { border: 0; border-radius: 4px; background: var(--ink); color: white; cursor: pointer; font-size: 12px; font-weight: 700; white-space: nowrap; }
.search-bar button { padding: 13px 18px; }
.quick-searches { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-top: 13px; color: var(--muted); font-size: 11px; }
.quick-searches button { padding: 0; border: 0; border-bottom: 1px solid #b8beb4; background: transparent; color: var(--muted); cursor: pointer; font-size: 11px; }
.hero-visual { position: relative; height: 375px; }
.sun-disc { position: absolute; top: 12px; right: 6%; width: 285px; height: 285px; border-radius: 50%; background: #ffe2b6; }
.cocktail-glass { position: absolute; top: 56px; left: 50%; width: 175px; height: 270px; border: 4px solid rgba(255, 255, 255, .72); border-top: 0; border-radius: 5px 5px 80px 80px; transform: translateX(-50%) rotate(5deg); overflow: visible; box-shadow: 5px 11px 20px rgba(92, 105, 72, .1); }
.drink { position: absolute; right: 3px; bottom: 5px; left: 3px; height: 183px; border-radius: 0 0 76px 76px; background: linear-gradient(135deg, #ffc15b, #e95832); }
.ice { position: absolute; width: 38px; height: 38px; border: 1px solid rgba(255, 255, 255, .45); border-radius: 8px; background: rgba(255, 237, 191, .35); transform: rotate(22deg); }
.ice-one { top: 68px; left: 35px; }.ice-two { top: 97px; right: 33px; transform: rotate(-15deg); }.straw { position: absolute; top: -41px; right: 50px; width: 5px; height: 112px; background: var(--coral); transform: rotate(18deg); }.garnish { position: absolute; top: -53px; right: -18px; font-size: 32px; transform: rotate(12deg); }.glass-shadow { position: absolute; bottom: 40px; left: 50%; width: 245px; height: 24px; border-radius: 50%; background: rgba(87, 100, 64, .13); filter: blur(9px); transform: translateX(-50%); }.fruit { position: absolute; z-index: 2; font-size: 53px; }.fruit-one { right: 2%; bottom: 48px; transform: rotate(-18deg); }.fruit-two { bottom: 7px; left: 15%; font-size: 40px; transform: rotate(22deg); }.visual-note { position: absolute; right: 3%; bottom: 0; color: var(--muted); font-size: 11px; font-style: italic; }
.content-section { padding: 44px 0; }.section-heading { display: flex; align-items: end; justify-content: space-between; margin-bottom: 25px; }h2 { margin-bottom: 0; font-size: 31px; line-height: 1.1; }.text-link { color: var(--ink); font-size: 12px; font-weight: 700; text-decoration: none; }.text-link span { margin-left: 7px; color: var(--coral); font-size: 17px; }.mood-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 13px; }.mood-card { min-height: 128px; padding: 20px; border: 1px solid transparent; border-radius: 5px; color: var(--ink); text-align: left; cursor: pointer; transition: transform .2s, border-color .2s; }.mood-card:hover { border-color: var(--ink); transform: translateY(-3px); }.mood-icon { display: block; margin-bottom: 18px; font-size: 24px; }.mood-label { display: block; margin-bottom: 5px; font-size: 14px; font-weight: 700; }.mood-count { color: #6f766d; font-size: 11px; }.mood-mint { background: #dcefd7; }.mood-peach { background: #f8ddd0; }.mood-lilac { background: #e6e0ef; }.mood-yellow { background: #f5edbf; }
.recipes-section { padding-top: 30px; }.filter-button { padding: 9px 12px; border: 1px solid var(--line); border-radius: 3px; background: transparent; color: var(--muted); cursor: pointer; font-size: 11px; }.filter-button span { margin-left: 14px; color: var(--coral); }.recipe-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }.recipe-card { overflow: hidden; border: 1px solid var(--line); border-radius: 5px; background: white; }.recipe-image { position: relative; display: grid; height: 188px; place-items: center; overflow: hidden; }.recipe-image::before, .recipe-image::after { position: absolute; width: 145px; height: 145px; border: 1px solid rgba(255,255,255,.25); border-radius: 50%; content: ''; }.recipe-image::after { width: 210px; height: 210px; }.recipe-image > span:first-child { z-index: 1; font-size: 77px; filter: drop-shadow(4px 8px 8px rgba(65, 50, 30, .17)); }.image-coral { background: #efa67c; }.image-green { background: #adc99a; }.image-berry { background: #c38891; }.rating { position: absolute; top: 14px; right: 14px; z-index: 2; padding: 6px 8px; border-radius: 3px; background: rgba(255, 255, 255, .8); font-size: 10px; font-weight: 700; }.recipe-details { padding: 17px 18px 14px; }.recipe-meta { display: flex; justify-content: space-between; margin-bottom: 10px; color: var(--coral); font-size: 10px; font-weight: 700; text-transform: uppercase; }.recipe-meta span:last-child { color: var(--muted); font-weight: 500; text-transform: none; }.recipe-details h3 { margin-bottom: 6px; font-family: 'Playfair Display', serif; font-size: 21px; }.recipe-details p { min-height: 32px; margin-bottom: 17px; color: var(--muted); font-size: 12px; line-height: 1.4; }.recipe-footer { display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--line); padding-top: 12px; color: var(--muted); font-size: 10px; }.recipe-footer button { border: 0; background: transparent; color: var(--coral); cursor: pointer; font-size: 22px; line-height: .7; }.empty-state { padding: 35px 0; color: var(--muted); text-align: center; }.share-banner { display: flex; align-items: center; justify-content: space-between; margin: 48px 0 32px; padding: 31px 36px; border-radius: 5px; background: var(--lime); }.share-banner h2 { margin-bottom: 7px; font-size: 26px; }.share-banner p:not(.eyebrow) { margin-bottom: 0; color: #5f6b4c; font-size: 13px; }.primary-button { padding: 14px 19px; }.primary-button span { margin-left: 16px; color: var(--lime); }.footer { display: flex; justify-content: space-between; border-top: 1px solid var(--line); padding: 22px 0 28px; color: var(--muted); font-size: 10px; }
@media (max-width: 760px) { .page-shell { padding: 0 20px; }.topbar { height: 72px; }.navigation { display: none; }.hero-section { display: block; padding: 48px 0 30px; }.hero-visual { height: 295px; margin-top: 32px; }.sun-disc { width: 225px; height: 225px; right: 12%; }.cocktail-glass { top: 34px; width: 145px; height: 225px; }.drink { height: 153px; }.fruit-one { right: 0; bottom: 33px; }.fruit-two { left: 7%; }.visual-note { right: 0; }.section-heading { align-items: start; flex-direction: column; gap: 16px; }.mood-grid, .recipe-grid { grid-template-columns: 1fr 1fr; }.mood-card { min-height: 115px; padding: 16px; }.recipe-image { height: 145px; }.recipe-details { padding: 14px; }.recipe-details p { min-height: 50px; }.share-banner { display: block; margin-top: 28px; padding: 25px; }.share-banner .primary-button { margin-top: 20px; }.footer { gap: 20px; line-height: 1.5; }.footer span:last-child { text-align: right; } }
@media (max-width: 460px) { h1 { font-size: 44px; }.search-bar button { padding: 13px 11px; }.mood-grid, .recipe-grid { grid-template-columns: 1fr; }.recipe-image { height: 180px; }.share-banner h2 { font-size: 23px; } }

.mood-mint { background: #ffe0b2; }
.mood-peach { background: #ffd0b5; }
.mood-lilac { background: #f6d9c5; }
.mood-yellow { background: #ffedb8; }
.image-coral { background: #f5a06e; }
.image-green { background: #e8ad68; }
.image-berry { background: #e58b67; }
</style>
