<template>
  <main class="site-shell">
    <header class="topbar">
      <a class="brand" href="#top" aria-label="Banana Split, home">
        <svg class="brand-logo" viewBox="0 0 36 36" fill="none" aria-hidden="true">
          <path d="M6 18C6 18 10 28 22 28C28 28 32 24 32 24C32 24 26 25 20 23C13 20.5 9 13 8 8C8 8 6 13 6 18Z" fill="#ffc83b" stroke="#2c1b15" stroke-width="2.5" stroke-linejoin="round" />
          <path d="M12 11C12 11 16 7 24 9" stroke="#e76532" stroke-width="2.5" stroke-linecap="round" />
          <circle cx="25" cy="8" r="3" fill="#e76532" stroke="#2c1b15" stroke-width="1.5" />
        </svg>
        <span>Banana Split</span>
      </a>
      <nav class="navigation" aria-label="Main navigation">
        <a class="active" href="#top">Home</a>
        <a href="#search">Search</a>
        <a href="#trending">Trending</a>
      </nav>
      <button class="profile-button" type="button">Se connecter</button>
    </header>

    <section id="top" class="hero-section">
      <div class="hero-copy">
        <p class="eyebrow">Cocktails made personal</p>
        <h1>Your next favorite drink is already in your kitchen.</h1>
        <p class="hero-text">Tell us what you have. We will turn it into a recipe worth sharing.</p>
      </div>
      <video class="hero-video" autoplay muted loop playsinline aria-label="Cocktail video background">
        <source :src="cocktailVideo" type="video/mp4" />
      </video>
    </section>

    <section id="search" class="search-section">
      <div class="section-label">Find your next pour</div>
      <h2>Search a cocktail</h2>
      <p>Look through the recipes from our community and find the right drink for what you have at home.</p>
      <label class="search-bar" for="recipe-search">
        <span aria-hidden="true">⌕</span>
        <input id="recipe-search" v-model="searchQuery" type="search" placeholder="Search by cocktail, ingredient or author" />
        <button v-if="searchQuery" type="button" aria-label="Clear search" @click="searchQuery = ''">Clear</button>
      </label>
    </section>

    <section id="trending" class="trending-section">
      <div class="section-heading">
        <div>
          <div class="section-label">Made by the community</div>
          <h2>Drinks of the moment</h2>
        </div>
        <span class="recipe-count">{{ filteredRecipes.length }} recipes</span>
      </div>
      <div v-if="filteredRecipes.length" class="recipe-grid">
        <article v-for="recipe in filteredRecipes" :key="recipe.recipe_id" class="recipe-card">
          <div class="recipe-art">
            <img class="recipe-photo" :src="recipe.image" :alt="recipe.title" />
            <span class="recipe-rating">{{ recipe.rating }}/5</span>
          </div>
          <div class="recipe-body">
            <div class="recipe-meta"><span>Cocktail</span><span>By {{ recipe.author }}</span></div>
            <h3>{{ recipe.title }}</h3>
            <p>{{ recipe.description }}</p>
            <div class="recipe-specs"><span>{{ recipe.glass_name }}</span><span>{{ recipe.capacity_cl }} cl</span></div>
            <div class="recipe-ingredients">{{ recipe.ingredients.join(' · ') }}</div>
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
const recipeImages = {
  1: pineappleVodkaImage,
  2: rumSunriseImage,
  3: limeGrenadineFizzImage,
  4: tropicalRumCoolerImage,
  5: fiveIngredientPunchImage,
}

const recipes = cocktailData.recipes.map((recipe) => {
  const author = cocktailData.users.find((user) => user.user_id === recipe.user_id)
  const recipeIngredients = cocktailData.recipe_ingredients
    .filter((item) => item.recipe_id === recipe.recipe_id)
    .map((item) => cocktailData.ingredients.find((ingredient) => ingredient.ingredient_id === item.ingredient_id)?.ingredient_name)
    .filter(Boolean)
  const reviews = cocktailData.reviews.filter((review) => review.recipe_id === recipe.recipe_id)
  const rating = reviews.length ? reviews.reduce((total, review) => total + review.rating, 0) / reviews.length : 0

  return { ...recipe, author: author?.username ?? 'Community', ingredients: recipeIngredients, rating: rating.toFixed(1), image: recipeImages[recipe.recipe_id] }
})

const filteredRecipes = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  if (!query) return recipes
  return recipes.filter((recipe) => `${recipe.title} ${recipe.description} ${recipe.author} ${recipe.ingredients.join(' ')}`.toLowerCase().includes(query))
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@500;600;700;800&family=Playfair+Display:wght@600;700&display=swap');
:root { --ink: #2c1b15; --muted: #806b61; --paper: #fff6ed; --line: #f0d4c1; --orange: #e76532; --orange-bright: #f28a42; --gold: #ffc83b; --cream: #fffaf5; }
* { box-sizing: border-box; } html { scroll-behavior: smooth; } body { margin: 0; background: var(--paper); color: var(--ink); font-family: 'DM Sans', sans-serif; } button, input { font: inherit; }
.site-shell { max-width: 1180px; margin: 0 auto; padding: 0 30px; overflow: visible; }.topbar { height: 84px; display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid var(--line); }.brand { display: flex; align-items: center; gap: 10px; color: var(--ink); font-family: 'Playfair Display', serif; font-size: 21px; text-decoration: none; }.brand-logo { width: 34px; height: 34px; }.navigation { display: flex; gap: 28px; }.navigation a { color: var(--muted); font-size: 12px; text-decoration: none; }.navigation a:hover, .navigation a.active { color: var(--orange); font-weight: 700; }.profile-button { padding: 10px 16px; border: 2px solid var(--ink); border-radius: 12px; background: rgb(255, 197, 0); color: var(--ink); cursor: pointer; font-size: 12px; font-weight: 800; white-space: nowrap; }
.hero-section { display: grid; grid-template-columns: 1.05fr .95fr; min-height: 500px; align-items: center; gap: 50px; padding: 72px 0 55px; }.eyebrow { margin: 0 0 14px; color: var(--orange); font-size: 11px; font-weight: 800; letter-spacing: .13em; text-transform: uppercase; }.hero-copy h1 { max-width: 620px; margin: 0 0 23px; font-family: 'Playfair Display', serif; font-size: clamp(44px, 5.2vw, 72px); letter-spacing: -.05em; line-height: .96; text-shadow: 3px 3px 0 #ffd3a4; }.hero-text { max-width: 420px; color: var(--muted); font-size: 15px; line-height: 1.65; }.search-bar { display: flex; max-width: 535px; align-items: center; gap: 8px; margin-top: 27px; padding: 7px; border: 3px solid var(--ink); border-radius: 18px; background: white; box-shadow: 5px 6px 0 var(--orange-bright); }.search-bar input { width: 100%; min-width: 0; border: 0; outline: 0; padding: 10px; color: var(--ink); font-size: 13px; }.search-bar button, .dark-button { border: 0; border-radius: 12px; background: var(--ink); color: white; cursor: pointer; font-size: 12px; font-weight: 800; white-space: nowrap; }.search-bar button { padding: 14px 18px; }.search-note { margin-top: 15px; color: var(--muted); font-size: 11px; }.search-note button { margin-left: 7px; border: 0; border-bottom: 2px solid var(--orange); background: transparent; color: var(--orange); cursor: pointer; font-size: 11px; font-weight: 700; }
.hero-art { position: relative; height: 370px; }.art-sun { position: absolute; top: 18px; right: 5%; width: 290px; height: 290px; border: 5px solid var(--ink); border-radius: 45% 55% 50% 50%; background: #ffd38a; transform: rotate(8deg); box-shadow: 10px 10px 0 #f5a06e; }.art-glass { position: absolute; top: 62px; left: 50%; width: 175px; height: 260px; overflow: visible; border: 5px solid var(--ink); border-top: 0; border-radius: 8px 8px 80px 80px; transform: translateX(-50%) rotate(4deg); }.art-drink { position: absolute; right: 4px; bottom: 5px; left: 4px; height: 175px; border-radius: 0 0 72px 72px; background: linear-gradient(#ffc15b, #e95832); }.art-ice { position: absolute; width: 38px; height: 38px; border: 2px solid rgba(44,27,21,.35); border-radius: 8px; background: rgba(255,255,255,.3); transform: rotate(20deg); }.ice-left { top: 65px; left: 30px; }.ice-right { top: 100px; right: 28px; transform: rotate(-14deg); }.art-straw { position: absolute; top: -48px; right: 45px; width: 6px; height: 112px; border: 2px solid var(--ink); background: var(--orange); transform: rotate(16deg); }.art-orange { position: absolute; right: 1%; bottom: 28px; width: 54px; height: 54px; border: 4px solid var(--ink); border-radius: 50%; background: #ffad4d; }.art-orange::after { position: absolute; top: 22px; left: 7px; width: 32px; height: 3px; background: var(--ink); content: ''; transform: rotate(45deg); }.art-bubble { position: absolute; border: 3px solid var(--ink); border-radius: 50%; background: var(--orange); }.bubble-one { top: 26px; left: 8%; width: 19px; height: 19px; }.bubble-two { right: 0; bottom: 120px; width: 13px; height: 13px; background: var(--gold); }.hero-art p { position: absolute; right: 3%; bottom: 0; color: var(--muted); font-size: 11px; font-style: italic; }
.section-block { padding: 74px 0; }.ingredients-section { display: grid; grid-template-columns: .8fr 1.2fr; gap: 70px; border-top: 2px solid var(--line); }.section-intro h2, .section-heading h2, .community-copy h2 { margin: 0 0 17px; font-family: 'Playfair Display', serif; font-size: 36px; letter-spacing: -.04em; line-height: 1.05; }.section-intro > p:last-child { max-width: 330px; color: var(--muted); font-size: 13px; line-height: 1.6; }.ingredient-panel { display: flex; align-content: start; flex-wrap: wrap; gap: 12px; padding: 25px; border: 3px solid var(--ink); border-radius: 20px; background: #ffd8a5; box-shadow: 7px 8px 0 var(--orange); }.ingredient-chip { display: flex; align-items: center; gap: 9px; padding: 12px 14px; border: 2px solid var(--ink); border-radius: 12px; background: var(--cream); color: var(--ink); cursor: pointer; font-size: 12px; font-weight: 700; }.chip-dot { width: 12px; height: 12px; border: 2px solid var(--ink); border-radius: 50%; }.dot-yellow { background: #ffd34f; }.dot-gold { background: #f2a338; }.dot-green { background: #9cbc6b; }.dot-orange { background: var(--orange); }.dot-red { background: #dc5f42; }.dot-pink { background: #e98c91; }.chip-plus { margin-left: 5px; color: var(--orange); font-size: 18px; line-height: 10px; }.ingredient-more { width: 100%; margin-top: 16px; border: 0; background: transparent; color: var(--orange); cursor: pointer; font-size: 12px; font-weight: 800; text-align: left; }
.section-heading { display: flex; align-items: end; justify-content: space-between; margin-bottom: 25px; }.filter-button { padding: 11px 14px; border: 2px solid var(--ink); border-radius: 11px; background: var(--gold); color: var(--ink); cursor: pointer; font-size: 11px; font-weight: 800; }.recipe-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }.recipe-card { overflow: hidden; border: 3px solid var(--ink); border-radius: 18px; background: var(--cream); box-shadow: 5px 6px 0 #f5a06e; transition: transform .2s; }.recipe-card:hover { transform: translateY(-5px) rotate(.5deg); }.recipe-art { position: relative; display: grid; height: 195px; place-items: center; overflow: hidden; }.art-coral { background: #ffad70; }.art-yellow { background: #ffc970; }.art-peach { background: #f28f6d; }.recipe-shape { display: block; width: 98px; height: 130px; border: 5px solid var(--ink); border-radius: 12px 12px 38px 38px; background: linear-gradient(#ffd477 0 23%, #ed663c 23%); box-shadow: 7px 8px 0 rgba(44,27,21,.22); transform: rotate(-5deg); }.shape-round { border-radius: 50% 50% 22px 22px; background: linear-gradient(#ffe29b 0 20%, #f28a42 20%); transform: rotate(5deg); }.shape-wide { width: 116px; height: 105px; border-radius: 35px 35px 14px 14px; background: linear-gradient(#ffc56d 0 20%, #e76532 20%); transform: rotate(-3deg); }.recipe-rating { position: absolute; top: 13px; right: 13px; padding: 6px 8px; border: 2px solid var(--ink); border-radius: 9px; background: var(--cream); font-size: 10px; font-weight: 800; }.recipe-body { padding: 18px; }.recipe-meta { display: flex; justify-content: space-between; margin-bottom: 10px; color: var(--orange); font-size: 10px; font-weight: 800; text-transform: uppercase; }.recipe-meta span:last-child { color: var(--muted); text-transform: none; }.recipe-body h3 { margin: 0 0 7px; font-family: 'Playfair Display', serif; font-size: 22px; }.recipe-body p { min-height: 37px; margin: 0 0 17px; color: var(--muted); font-size: 12px; line-height: 1.45; }.recipe-bottom { display: flex; align-items: center; justify-content: space-between; border-top: 2px solid var(--line); padding-top: 12px; color: var(--muted); font-size: 10px; }.recipe-bottom button { padding: 7px 10px; border: 2px solid var(--ink); border-radius: 8px; background: #ffd38a; color: var(--ink); cursor: pointer; font-size: 10px; font-weight: 800; }.empty-state { padding: 30px; color: var(--muted); text-align: center; }
.community-section { display: grid; grid-template-columns: 1fr .9fr; gap: 55px; align-items: center; margin: 25px 0 55px; padding: 42px; border: 3px solid var(--ink); border-radius: 22px; background: var(--orange); box-shadow: 8px 9px 0 var(--ink); }.community-copy h2 { max-width: 500px; color: white; font-size: 38px; }.community-copy > p:not(.eyebrow) { max-width: 430px; color: #fff0df; font-size: 13px; line-height: 1.6; }.dark-button { margin-top: 12px; padding: 14px 18px; }.community-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }.community-stats div { padding: 18px 10px; border: 2px solid var(--ink); border-radius: 13px; background: #ffd38a; text-align: center; }.community-stats strong, .community-stats span { display: block; }.community-stats strong { font-family: 'Playfair Display', serif; font-size: 28px; }.community-stats span { margin-top: 6px; color: var(--muted); font-size: 10px; }.footer { display: flex; justify-content: space-between; border-top: 2px solid var(--line); padding: 23px 0 28px; color: var(--muted); font-size: 10px; }

.recipe-shape::before, .recipe-shape::after { position: absolute; content: ''; }
.cocktail-sunset { background: linear-gradient(#ffd477 0 18%, #f47a3c 18% 100%); }
.cocktail-sunset::before { top: -18px; right: 13px; width: 5px; height: 28px; border: 2px solid var(--ink); background: var(--orange); transform: rotate(14deg); }
.cocktail-garden { background: linear-gradient(#e9f1b5 0 20%, #84ad69 20% 100%); }
.cocktail-garden::before { top: -10px; left: 18px; width: 24px; height: 9px; border: 3px solid var(--ink); border-radius: 50%; background: #9bbc72; transform: rotate(-20deg); }
.cocktail-berry { background: linear-gradient(#ffd08b 0 20%, #bd5961 20% 100%); }
.cocktail-berry::before { top: 18px; right: 18px; width: 10px; height: 10px; border: 2px solid var(--ink); border-radius: 50%; background: #f5a06e; box-shadow: -19px 12px 0 -2px #e76532; }
.cocktail-orange { background: linear-gradient(#fff0b0 0 18%, #ed7134 18% 100%); }
.cocktail-orange::before { top: -12px; left: 14px; width: 34px; height: 5px; border: 2px solid var(--ink); border-radius: 50%; background: #ffd34f; }
.cocktail-midnight { background: linear-gradient(#f7bd72 0 22%, #7b4654 22% 100%); }
.cocktail-midnight::before { top: 31px; left: 20px; width: 7px; height: 7px; border-radius: 50%; background: #ffd38a; box-shadow: 18px 16px 0 #e76532, 4px 33px 0 #ffd38a; }
.cocktail-golden { background: linear-gradient(#ffe2a0 0 21%, #efa34c 21% 100%); }
.cocktail-golden::before { top: -12px; right: 14px; width: 20px; height: 9px; border: 3px solid var(--ink); border-radius: 50%; background: #ffc83b; transform: rotate(20deg); }
.cocktail-cooler { background: linear-gradient(#f7eab0 0 20%, #8cb875 20% 100%); }
.cocktail-cooler::before { top: -15px; left: 21px; width: 32px; height: 7px; border: 3px solid var(--ink); border-radius: 50%; background: #a9c983; transform: rotate(-8deg); }
.recipe-photo { width: 100%; height: 100%; display: block; object-fit: contain; object-position: center center; background: #fff6ed; }
.recipe-specs { display: flex; flex-wrap: wrap; gap: 6px; margin: 0 0 15px; color: var(--muted); font-size: 10px; }
.recipe-specs span { padding: 4px 6px; border: 1px solid var(--line); border-radius: 6px; background: #fff6ed; }
.hero-section { position: relative; display: grid; width: 100vw; min-height: calc(100svh - 84px); margin-left: calc(50% - 50vw); padding: 72px 30px 55px; place-items: center; overflow: hidden; isolation: isolate; }
.hero-section::after { position: absolute; z-index: -1; inset: 0; background: linear-gradient(90deg, rgba(44, 27, 21, .75), rgba(44, 27, 21, .38)); content: ''; }
.hero-video { position: absolute; z-index: -2; width: 100%; height: 100%; object-fit: cover; object-position: center; }
.hero-copy { z-index: 1; max-width: 700px; text-align: center; }
.hero-copy h1 { max-width: 700px; color: white; text-shadow: 3px 3px 0 rgba(44, 27, 21, .45); }
.hero-text { margin-right: auto; margin-left: auto; color: #fff4e8; }
.search-bar { margin-right: auto; margin-left: auto; text-align: left; }
.search-note { color: #fff4e8; }
.hero-section .eyebrow { color: #ffd38a; }
.search-section, .trending-section { padding: 84px 0; }
.search-section { max-width: 760px; margin: 0 auto; text-align: center; }
.section-label { margin-bottom: 12px; color: var(--orange); font-size: 11px; font-weight: 800; letter-spacing: .13em; text-transform: uppercase; }
.search-section h2, .section-heading h2 { margin: 0; font-family: 'Playfair Display', serif; font-size: clamp(34px, 5vw, 52px); letter-spacing: -.04em; line-height: 1; }
.search-section > p { max-width: 500px; margin: 18px auto 28px; color: var(--muted); font-size: 14px; line-height: 1.6; }
.search-section .search-bar { width: 100%; max-width: 680px; margin: 0 auto; text-align: left; box-shadow: 5px 6px 0 var(--orange-bright); }
.search-section .search-bar > span { padding-left: 10px; color: var(--orange); font-size: 24px; line-height: 1; }
.search-section .search-bar button { padding: 9px 12px; border: 2px solid var(--ink); border-radius: 9px; background: var(--gold); color: var(--ink); cursor: pointer; font-size: 11px; font-weight: 800; }
.trending-section { border-top: 2px solid var(--line); }
.section-heading { align-items: end; }
.recipe-count { color: var(--muted); font-size: 12px; }
.recipe-ingredients { min-height: 32px; color: var(--orange); font-size: 11px; font-weight: 700; line-height: 1.45; }
.empty-state { margin: 0; padding: 38px; border: 2px dashed var(--line); color: var(--muted); text-align: center; }
@media (max-width: 760px) { .site-shell { padding: 0 20px; }.topbar { height: 70px; }.navigation { gap: 12px; }.navigation a { font-size: 11px; }.hero-section { min-height: calc(100svh - 70px); margin-left: calc(50% - 50vw); padding: 40px 20px; }.hero-copy { width: 100%; }.hero-video { object-position: center; }.search-section, .trending-section { padding: 58px 0; }.section-heading { align-items: start; flex-direction: column; gap: 12px; }.recipe-grid { grid-template-columns: 1fr; }.recipe-card { width: 100%; } }
</style>
