<script setup>
import { ref } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import logoUrl from '../../Images/bananasplit_logo.jpg'
import logoHover from '../../Images/bananasplit_logo_animated.gif'

const isDark = ref(false)

function toggleTheme() {
  isDark.value = !isDark.value
  document.documentElement.dataset.theme = isDark.value ? 'dark' : 'light'
}
</script>

<template>
  <div class="site-layout">
    <header class="site-header">
      <div class="header-content">
        <RouterLink class="logo-link" to="/" aria-label="Banana Split home">
          <img :src="logoUrl" alt="Banana Split" class="logo">
        </RouterLink>

        <nav aria-label="Main navigation">
          <ul class="nav-links">
            <li><RouterLink to="/" exact-active-class="active">Home</RouterLink></li>
            <li><RouterLink to="/recipes" active-class="active">Recipes</RouterLink></li>
            <li><RouterLink to="/albums" active-class="active">Albums</RouterLink></li>
            <li><RouterLink to="/members" active-class="active">Members</RouterLink></li>
          </ul>
        </nav>

        <div class="header-actions">
          <button
            class="theme-toggle"
            type="button"
            :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
            :aria-pressed="isDark"
            @click="toggleTheme"
          >
            <svg v-if="!isDark" class="theme-icon" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="4"></circle>
              <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"></path>
            </svg>
            <svg v-else class="theme-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20.2 15.5A8.5 8.5 0 0 1 8.5 3.8 8.5 8.5 0 1 0 20.2 15.5Z"></path>
            </svg>
          </button>
          <RouterLink class="signup-button" to="/sign-up">Sign up</RouterLink>
        </div>
      </div>
    </header>

    <div class="page-content">
      <RouterView />
    </div>

    <footer class="site-footer">
      <p>Banana Split &mdash; Cocktail recipes and mixology.</p>
    </footer>
  </div>
</template>

<style>
:root {
  color-scheme: light;
  --page-bg: #ffffff;
  --surface: #ffffff;
  --text: #202020;
  --nav-text: #202020;
  --button: #f28c00;
  --button-hover: #ffbd45;
  --header-shadow: 0 2px 12px rgb(0 0 0 / 10%);
}

:root[data-theme='dark'] {
  color-scheme: dark;
  --page-bg: #171717;
  --surface: #222222;
  --text: #f4f4f4;
  --nav-text: #f4f4f4;
  --button: #ff9a1f;
  --button-hover: #ffc257;
  --header-shadow: 0 2px 12px rgb(0 0 0 / 30%);
}

body {
  min-width: 320px;
  min-height: 100vh;
  margin: 0;
  background-color: var(--page-bg);
  color: var(--text);
  font-family: Arial, sans-serif;
}

.site-layout {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
}

.site-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  padding: 10px 5%;
  background-color: var(--surface);
  box-shadow: var(--header-shadow);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 24px;
}

.logo {
  display: block;
  width: auto;
  height: 50px;
}

.logo-link:hover .logo {
  content: url('../../Images/bananasplit_logo_animate.gif');
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 30px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.nav-links a {
  color: var(--nav-text);
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.3s ease;
}

.nav-links a:hover,
.nav-links a.active {
  color: var(--button);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.theme-toggle {
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--text);
  cursor: pointer;
}

.theme-toggle:hover {
  color: var(--button-hover);
}

.theme-icon {
  width: 22px;
  height: 22px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.8;
}

.signup-button {
  padding: 10px 18px;
  border-radius: 6px;
  background-color: var(--button);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.signup-button:hover {
  background-color: var(--button-hover);
  color: #302000;
}

.page-content {
  flex: 1;
}

.site-footer {
  padding: 18px 5%;
  background-color: var(--surface);
  color: var(--text);
  text-align: center;
}

.site-footer p {
  margin: 0;
}

</style>