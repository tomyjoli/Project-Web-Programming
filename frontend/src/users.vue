<script setup>
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import {
  authError,
  authInitialized,
  currentUser,
  getUserInitials,
  registerAccount,
  signIn as authenticate,
  signOut as endSession,
} from '../auth.js'

const route = useRoute()
const isRegistering = computed(() => route.path === '/sign-up')
const message = ref('')
const isError = ref(false)
const isSubmitting = ref(false)
const loginForm = ref({ email: '', password: '' })
const registrationForm = ref({
  username: '',
  email: '',
  password: '',
  bio: '',
  date_of_birth: '',
  profile_picture_url: '',
})
const initials = computed(() => getUserInitials(currentUser.value?.username ?? ''))

watch(() => route.path, () => {
  message.value = ''
  isError.value = false
})

async function signIn() {
  await submit(async () => {
    await authenticate(loginForm.value)
    loginForm.value.password = ''
    message.value = 'You are signed in.'
  })
}

async function register() {
  await submit(() => registerAccount({
    username: registrationForm.value.username,
    email: registrationForm.value.email,
    password: registrationForm.value.password,
    bio: registrationForm.value.bio,
    date_of_birth: registrationForm.value.date_of_birth,
    profile_picture_url: registrationForm.value.profile_picture_url,
  }))
  if (!isError.value) {
    registrationForm.value.password = ''
    message.value = 'Your account has been created and you are signed in.'
  }
}

async function submit(action) {
  isSubmitting.value = true
  message.value = ''
  isError.value = false
  try {
    await action()
  } catch (error) {
    message.value = error.message
    isError.value = true
  } finally {
    isSubmitting.value = false
  }
}

async function signOut() {
  await submit(async () => {
    await endSession()
    message.value = 'You have signed out.'
  })
}
</script>

<template>
  <main class="users-page">
    <section v-if="currentUser" class="auth-card account-card">
      <div class="account-initials" aria-hidden="true">{{ initials }}</div>
      <h1>Welcome, {{ currentUser.username }}!</h1>
      <p class="auth-description">{{ currentUser.email }}</p>
      <p class="account-notice">
        Your account is saved in the database. Your sign-in session will be restored when you reload the site.
      </p>
      <button class="auth-submit" type="button" :disabled="isSubmitting" @click="signOut">
        {{ isSubmitting ? 'Signing out…' : 'Sign out' }}
      </button>
      <p v-if="message" class="auth-message" :class="{ 'auth-error': isError }" role="status" aria-live="polite">
        {{ message }}
      </p>
    </section>

    <section v-else-if="!authInitialized" class="auth-card" role="status">
      <p class="auth-description">Checking your sign-in session…</p>
    </section>

    <section v-else class="auth-card">
      <header class="auth-heading">
        <p class="auth-eyebrow">Banana Split community</p>
        <h1>{{ isRegistering ? 'Create your account' : 'Welcome back' }}</h1>
        <p class="auth-description">
          {{ isRegistering ? 'Join the community and share your favorite recipes.' : 'Sign in to your account to continue.' }}
        </p>
      </header>

      <form v-if="isRegistering" class="auth-form" @submit.prevent="register">
        <label class="form-field">
          <span>Username</span>
          <input
            v-model.trim="registrationForm.username"
            type="text"
            name="username"
            maxlength="50"
            autocomplete="username"
            placeholder="Your username"
            required
          >
        </label>

        <label class="form-field">
          <span>Email address</span>
          <input
            v-model.trim="registrationForm.email"
            type="email"
            name="email"
            maxlength="100"
            autocomplete="email"
            placeholder="you@example.com"
            required
          >
        </label>

        <label class="form-field">
          <span>Password</span>
          <input
            v-model="registrationForm.password"
            type="password"
            name="new-password"
            minlength="8"
            maxlength="72"
            autocomplete="new-password"
            placeholder="Choose a password"
            required
          >
        </label>

        <label class="form-field">
          <span>Date of birth <span class="optional-label">(optional)</span></span>
          <input v-model="registrationForm.date_of_birth" type="date" name="date_of_birth">
        </label>

        <label class="form-field">
          <span>Profile picture URL <span class="optional-label">(optional)</span></span>
          <input
            v-model.trim="registrationForm.profile_picture_url"
            type="url"
            name="profile_picture_url"
            maxlength="255"
            placeholder="https://example.com/photo.jpg"
          >
        </label>

        <label class="form-field">
          <span>Bio <span class="optional-label">(optional)</span></span>
          <textarea
            v-model.trim="registrationForm.bio"
            name="bio"
            rows="3"
            placeholder="Tell us a little about yourself"
          ></textarea>
        </label>

        <button class="auth-submit" type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? 'Creating account…' : 'Create account' }}
        </button>
      </form>

      <form v-else class="auth-form" @submit.prevent="signIn">
        <label class="form-field">
          <span>Email address</span>
          <input
            v-model.trim="loginForm.email"
            type="email"
            name="email"
            maxlength="100"
            autocomplete="email"
            placeholder="you@example.com"
            required
          >
        </label>

        <label class="form-field">
          <span>Password</span>
          <input
            v-model="loginForm.password"
            type="password"
            name="current-password"
            maxlength="255"
            autocomplete="current-password"
            placeholder="Your password"
            required
          >
        </label>

        <button class="auth-submit" type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? 'Signing in…' : 'Sign in' }}
        </button>
      </form>

      <p v-if="authError" class="auth-message auth-error" role="alert">{{ authError }}</p>
      <p v-if="message" class="auth-message" :class="{ 'auth-error': isError }" role="status" aria-live="polite">
        {{ message }}
      </p>

      <p class="auth-switch">
        <template v-if="isRegistering">
          Already have an account? <RouterLink to="/users">Sign in</RouterLink>
        </template>
        <template v-else>
          No account yet? <RouterLink to="/sign-up">Create one</RouterLink>
        </template>
      </p>
    </section>
  </main>
</template>

<style scoped>
.users-page {
  display: grid;
  min-height: 100%;
  place-items: center;
  padding: 56px 20px;
  color: var(--text);
}

.auth-card {
  box-sizing: border-box;
  width: min(100%, 480px);
  padding: clamp(24px, 5vw, 40px);
  border-radius: 12px;
  background-color: var(--surface);
  box-shadow: var(--header-shadow);
}

.auth-heading {
  margin-bottom: 28px;
  text-align: center;
}

.auth-eyebrow {
  margin: 0 0 12px;
  color: var(--button);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.auth-heading h1,
.account-card h1 {
  margin: 0 0 12px;
  font-family: "Press Start 2P", "Terminal", "Courier New", monospace;
  font-size: clamp(20px, 4vw, 28px);
  line-height: 1.5;
  text-shadow: 2px 2px 0 var(--button);
}

.auth-description {
  margin: 0;
  color: var(--nav-text);
  line-height: 1.6;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-field > span {
  font-weight: 600;
}

.optional-label {
  color: var(--nav-text);
  font-size: 13px;
  font-weight: 400;
}

.form-field input,
.form-field textarea {
  box-sizing: border-box;
  width: 100%;
  padding: 12px;
  border: 1px solid color-mix(in srgb, var(--nav-text) 35%, transparent);
  border-radius: 6px;
  background-color: var(--page-bg);
  color: var(--text);
  font: inherit;
}

.form-field input:focus,
.form-field textarea:focus {
  outline: 2px solid var(--button);
  outline-offset: 1px;
}

.form-field textarea {
  resize: vertical;
}

.auth-submit {
  width: 100%;
  padding: 13px 18px;
  border: 0;
  border-radius: 6px;
  background-color: var(--button);
  color: #ffffff;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.auth-submit:hover {
  background-color: var(--button-hover);
  color: var(--text);
}

.auth-submit:disabled {
  cursor: wait;
  opacity: 0.7;
}

.auth-switch {
  margin: 24px 0 0;
  color: var(--nav-text);
  text-align: center;
}

.auth-switch a {
  color: var(--button);
  font-weight: 700;
  text-underline-offset: 3px;
}

.auth-switch a:hover {
  color: var(--button-hover);
}

.auth-message,
.account-notice {
  margin: 20px 0 0;
  padding: 12px;
  border-radius: 6px;
  background-color: var(--page-bg);
  color: var(--nav-text);
  font-size: 14px;
  line-height: 1.5;
}

.auth-error {
  color: #b42318;
}

.account-card {
  text-align: center;
}

.account-initials {
  display: grid;
  width: 68px;
  height: 68px;
  margin: 0 auto 24px;
  place-items: center;
  border-radius: 50%;
  background-color: var(--button);
  color: #ffffff;
  font-size: 24px;
  font-weight: 700;
}

.account-card .auth-submit {
  margin-top: 24px;
}

</style>
