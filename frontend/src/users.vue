<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import {
  authError,
  authInitialized,
  currentUser,
  deleteAccount as removeAccount,
  getUserInitials,
  registerAccount,
  signIn as authenticate,
  signOut as endSession,
  updateProfile,
} from '../auth.js'

const route = useRoute()
const isRegistering = computed(() => route.path === '/sign-up')
const message = ref('')
const isError = ref(false)
const isSubmitting = ref(false)
const accountDeleted = ref(false)
const showDeleteConfirmation = ref(false)
const avatarFailed = ref(false)
const deleteTrigger = ref(null)
const cancelDeleteButton = ref(null)
const loginForm = ref({ email: '', password: '' })
const profileForm = ref({
  username: '',
  email: '',
  bio: '',
  date_of_birth: '',
  profile_picture_url: '',
})
const registrationForm = ref({
  username: '',
  email: '',
  password: '',
  bio: '',
  date_of_birth: '',
  profile_picture_url: '',
})
const initials = computed(() => getUserInitials(profileForm.value.username || currentUser.value?.username || ''))

watch(currentUser, (user) => {
  if (!user) return
  profileForm.value = {
    username: user.username ?? '',
    email: user.email ?? '',
    bio: user.bio ?? '',
    date_of_birth: user.date_of_birth ? String(user.date_of_birth).slice(0, 10) : '',
    profile_picture_url: user.profile_picture_url ?? '',
  }
  avatarFailed.value = false
}, { immediate: true })

watch(() => route.path, () => {
  message.value = ''
  isError.value = false
  accountDeleted.value = false
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

async function saveProfile() {
  await submit(async () => {
    await updateProfile(profileForm.value)
    message.value = 'Your profile has been updated.'
  })
}

async function openDeleteConfirmation() {
  showDeleteConfirmation.value = true
  await nextTick()
  cancelDeleteButton.value?.focus()
}

function cancelDelete() {
  showDeleteConfirmation.value = false
  deleteTrigger.value?.focus()
}

async function deleteProfile() {
  await submit(async () => {
    await removeAccount()
    accountDeleted.value = true
    showDeleteConfirmation.value = false
    message.value = 'Your account has been deleted.'
  })
}
</script>

<template>
  <main class="users-page">
    <section v-if="currentUser" class="profile-card">
      <header class="profile-header">
        <div class="profile-avatar" aria-hidden="true">
          <img
            v-if="profileForm.profile_picture_url && !avatarFailed"
            :src="profileForm.profile_picture_url"
            alt=""
            @error="avatarFailed = true"
          >
          <span v-else>{{ initials }}</span>
        </div>
        <div class="profile-heading">
          <h1>Your profile</h1>
          <p class="auth-description">Manage your personal information and account settings.</p>
        </div>
        <button class="sign-out-button" type="button" :disabled="isSubmitting" @click="signOut">
          Sign out
        </button>
      </header>

      <form class="profile-form" @submit.prevent="saveProfile">
        <section class="profile-section">
          <div class="section-heading">
            <div>
              <h2>Personal details</h2>
              <p>These details are shown on your Banana Split account.</p>
            </div>
          </div>

          <div class="profile-fields">
            <label class="form-field">
              <span>Username</span>
              <input
                v-model.trim="profileForm.username"
                type="text"
                name="username"
                maxlength="50"
                autocomplete="given-name"
                required
              >
            </label>

            <label class="form-field">
              <span>Email address</span>
              <input
                v-model.trim="profileForm.email"
                type="email"
                name="email"
                maxlength="100"
                autocomplete="email"
                required
              >
            </label>

            <label class="form-field">
              <span>Date of birth <span class="optional-label">(optional)</span></span>
              <input v-model="profileForm.date_of_birth" type="date" name="date_of_birth">
            </label>

            <label class="form-field">
              <span>Profile photo URL <span class="optional-label">(optional)</span></span>
              <input
                v-model.trim="profileForm.profile_picture_url"
                type="url"
                name="profile_picture_url"
                maxlength="255"
                placeholder="https://example.com/photo.jpg"
                @input="avatarFailed = false"
              >
            </label>

            <label class="form-field full-width">
              <span>About you <span class="optional-label">(optional)</span></span>
              <textarea
                v-model.trim="profileForm.bio"
                name="bio"
                rows="4"
                maxlength="2000"
                placeholder="Tell the community a little about yourself"
              ></textarea>
            </label>
          </div>

          <div class="profile-actions">
            <p v-if="message" class="auth-message" :class="{ 'auth-error': isError }" role="status" aria-live="polite">
              {{ message }}
            </p>
            <button class="auth-submit save-button" type="submit" :disabled="isSubmitting">
              {{ isSubmitting ? 'Saving…' : 'Save changes' }}
            </button>
          </div>
        </section>
      </form>

      <section class="danger-zone" aria-labelledby="danger-zone-title">
        <div>
          <h2 id="danger-zone-title">Delete account</h2>
          <p>This permanently deletes your account, recipes, albums, and reviews.</p>
        </div>
        <button
          ref="deleteTrigger"
          class="delete-button"
          type="button"
          :disabled="isSubmitting"
          @click="openDeleteConfirmation"
        >
          {{ isSubmitting ? 'Please wait…' : 'Delete account' }}
        </button>
      </section>
    </section>

    <section v-else-if="accountDeleted" class="auth-card account-card">
      <div class="account-initials" aria-hidden="true">✓</div>
      <h1>Account deleted</h1>
      <p class="auth-description">Your account and its associated content have been permanently removed.</p>
      <RouterLink class="auth-submit account-link" to="/sign-up">Create a new account</RouterLink>
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

    <div
      v-if="showDeleteConfirmation"
      class="confirmation-overlay"
      @click.self="cancelDelete"
      @keydown.esc="cancelDelete"
    >
      <section
        class="confirmation-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-confirmation-title"
        aria-describedby="delete-confirmation-description"
      >
        <div class="confirmation-icon" aria-hidden="true">!</div>
        <p class="confirmation-eyebrow">This action cannot be undone</p>
        <h2 id="delete-confirmation-title">Are you really sure you want to delete your account?</h2>
        <p id="delete-confirmation-description">
          Your account, recipes, albums, and reviews will be permanently deleted.
        </p>
        <div class="confirmation-actions">
          <button
            ref="cancelDeleteButton"
            class="keep-account-button"
            type="button"
            :disabled="isSubmitting"
            @click="cancelDelete"
          >
            No, keep my account
          </button>
          <button class="confirm-delete-button" type="button" :disabled="isSubmitting" @click="deleteProfile">
            {{ isSubmitting ? 'Deleting…' : 'Yes, delete account' }}
          </button>
        </div>
      </section>
    </div>
  </main>
</template>

<style scoped>
.users-page {
  display: grid;
  min-height: 100%;
  place-items: center;
  padding: clamp(32px, 6vw, 72px) 20px;
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
  margin: 0 0 10px;
  color: var(--button);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.auth-heading h1,
.account-card h1,
.profile-heading h1 {
  margin: 0 0 12px;
  font-family: "Press Start 2P", "Terminal", "Courier New", monospace;
  font-size: clamp(18px, 3vw, 25px);
  line-height: 1.6;
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
  min-height: 46px;
  padding: 12px 14px;
  border: 1px solid color-mix(in srgb, var(--nav-text) 22%, transparent);
  border-radius: 8px;
  background-color: var(--page-bg);
  color: var(--text);
  font: inherit;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-field input:focus,
.form-field textarea:focus {
  border-color: var(--button);
  outline: none;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--button) 20%, transparent);
}

.form-field textarea {
  min-height: 110px;
  resize: vertical;
}

.auth-submit {
  display: inline-flex;
  min-height: 48px;
  align-items: center;
  justify-content: center;
  padding: 12px 20px;
  border: 0;
  border-radius: 8px;
  background-color: var(--button);
  color: #ffffff;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.auth-form .auth-submit {
  width: 100%;
}

.auth-submit:disabled {
  cursor: wait;
  opacity: 0.7;
}

.auth-submit:hover:not(:disabled) {
  background-color: var(--button-hover);
  color: var(--text);
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
  margin: 0;
  padding: 12px;
  border-radius: 8px;
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

.account-link {
  margin-top: 24px;
  color: #fff;
  text-decoration: none;
}

.profile-card {
  box-sizing: border-box;
  width: min(100%, 900px);
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--nav-text) 10%, transparent);
  border-radius: 18px;
  background: var(--surface);
  box-shadow: 0 18px 55px rgb(52 38 14 / 12%);
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 22px;
  padding: clamp(24px, 5vw, 42px);
  background:
    radial-gradient(ellipse at 92% 10%, color-mix(in srgb, var(--button) 18%, transparent), transparent 42%),
    var(--surface);
}

.profile-avatar {
  display: grid;
  width: 88px;
  height: 88px;
  flex: 0 0 88px;
  overflow: hidden;
  place-items: center;
  border: 4px solid color-mix(in srgb, var(--button) 28%, var(--surface));
  border-radius: 50%;
  background: var(--button);
  color: #fff;
  font-size: 28px;
  font-weight: 700;
  box-shadow: 0 6px 18px rgb(0 0 0 / 12%);
}

.profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-heading {
  min-width: 0;
  flex: 1;
}

.profile-heading .auth-eyebrow {
  margin-bottom: 8px;
}

.profile-heading h1 {
  margin-bottom: 8px;
}

.sign-out-button {
  align-self: flex-start;
  padding: 9px 14px;
  border: 1px solid color-mix(in srgb, var(--nav-text) 20%, transparent);
  border-radius: 8px;
  background: transparent;
  color: var(--text);
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.sign-out-button:hover:not(:disabled) {
  border-color: var(--button);
  color: var(--button);
}

.sign-out-button:disabled {
  cursor: wait;
  opacity: 0.65;
}

.profile-form {
  padding: 0 clamp(24px, 5vw, 42px);
}

.profile-section {
  padding: 28px 0 36px;
  border-top: 1px solid color-mix(in srgb, var(--nav-text) 12%, transparent);
}

.section-heading {
  margin-bottom: 24px;
}

.section-heading h2,
.danger-zone h2 {
  margin: 0 0 7px;
  font-size: 19px;
}

.section-heading p,
.danger-zone p {
  margin: 0;
  color: var(--nav-text);
  font-size: 14px;
  line-height: 1.5;
  opacity: 0.75;
}

.profile-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.full-width {
  grid-column: 1 / -1;
}

.profile-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 24px;
}

.profile-actions .auth-message {
  flex: 1;
}

.save-button {
  flex: 0 0 auto;
  min-width: 150px;
}

.danger-zone {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 24px clamp(24px, 5vw, 42px);
  border-top: 1px solid color-mix(in srgb, #dc2626 20%, transparent);
  background: color-mix(in srgb, #dc2626 5%, var(--surface));
}

.danger-zone h2 {
  color: #b42318;
}

.delete-button {
  flex: 0 0 auto;
  min-height: 44px;
  padding: 10px 16px;
  border: 1px solid #b42318;
  border-radius: 8px;
  background: #b42318;
  color: #fff;
  font: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.delete-button:hover:not(:disabled) {
  border-color: #8f1c13;
  background: #8f1c13;
}

.delete-button:disabled {
  cursor: wait;
  opacity: 0.65;
}

.confirmation-overlay {
  position: fixed;
  z-index: 2000;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgb(20 16 12 / 65%);
  backdrop-filter: blur(4px);
  inset: 0;
}

.confirmation-dialog {
  box-sizing: border-box;
  width: min(100%, 560px);
  padding: clamp(28px, 6vw, 48px);
  border: 1px solid color-mix(in srgb, #b42318 18%, transparent);
  border-radius: 20px;
  background: var(--surface);
  color: var(--text);
  text-align: center;
  box-shadow: 0 24px 80px rgb(0 0 0 / 30%);
}

.confirmation-icon {
  display: grid;
  width: 58px;
  height: 58px;
  margin: 0 auto 18px;
  place-items: center;
  border-radius: 50%;
  background: color-mix(in srgb, #b42318 12%, var(--surface));
  color: #b42318;
  font-size: 30px;
  font-weight: 800;
}

.confirmation-eyebrow {
  margin: 0 0 12px;
  color: #b42318;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.confirmation-dialog h2 {
  margin: 0 auto 14px;
  font-size: clamp(22px, 4vw, 30px);
  line-height: 1.25;
}

.confirmation-dialog > p:not(.confirmation-eyebrow) {
  max-width: 420px;
  margin: 0 auto;
  color: var(--nav-text);
  line-height: 1.6;
  opacity: 0.8;
}

.confirmation-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 30px;
}

.keep-account-button,
.confirm-delete-button {
  min-height: 48px;
  padding: 12px 18px;
  border: 1px solid transparent;
  border-radius: 8px;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

.keep-account-button {
  border-color: color-mix(in srgb, var(--nav-text) 20%, transparent);
  background: var(--surface);
  color: var(--text);
}

.keep-account-button:hover:not(:disabled) {
  border-color: var(--button);
  background: color-mix(in srgb, var(--button) 10%, var(--surface));
}

.confirm-delete-button {
  background: #b42318;
  color: #fff;
}

.confirm-delete-button:hover:not(:disabled) {
  background: #8f1c13;
}

.keep-account-button:disabled,
.confirm-delete-button:disabled {
  cursor: wait;
  opacity: 0.65;
}

.keep-account-button:focus-visible,
.confirm-delete-button:focus-visible {
  outline: 3px solid var(--button);
  outline-offset: 3px;
}

@media (max-width: 640px) {
  .profile-header {
    flex-wrap: wrap;
    gap: 16px;
  }

  .profile-avatar {
    width: 70px;
    height: 70px;
    flex-basis: 70px;
  }

  .profile-heading {
    flex-basis: calc(100% - 90px);
  }

  .sign-out-button {
    margin-left: auto;
  }

  .profile-fields {
    grid-template-columns: minmax(0, 1fr);
  }

  .full-width {
    grid-column: auto;
  }

  .profile-actions,
  .danger-zone {
    align-items: stretch;
    flex-direction: column;
  }

  .save-button,
  .delete-button {
    width: 100%;
  }

  .confirmation-actions {
    flex-direction: column-reverse;
  }

  .keep-account-button,
  .confirm-delete-button {
    width: 100%;
  }
}
</style>
