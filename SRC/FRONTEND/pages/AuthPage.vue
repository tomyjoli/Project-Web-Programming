<template>
    <section class="detail-page auth-page">
      <div class="auth-card">
        <p class="eyebrow">{{ currentPage === 'signup' ? 'Join the community' : 'Welcome back' }}</p>
        <h1>{{ currentPage === 'signup' ? 'New account?' : 'Sign in' }}</h1>
        <p class="auth-note">Accounts are saved only in this browser.</p>
        <form class="recipe-editor auth-form" @submit.prevent="submitAuthForm">
          <label v-if="currentPage === 'signup'">
            Username
            <input v-model.trim="authForm.username" required maxlength="50" autocomplete="username" />
          </label>
          <label>
            Email address
            <input v-model.trim="authForm.email" required type="email" maxlength="100" autocomplete="email" />
          </label>
          <label>
            Password
            <input v-model="authForm.password" required type="password" minlength="8" :autocomplete="currentPage === 'signup' ? 'new-password' : 'current-password'" />
          </label>
          <p v-if="authError" class="form-error" role="alert">{{ authError }}</p>
          <button class="create-button" type="submit">{{ currentPage === 'signup' ? 'Create account' : 'Sign in' }}</button>
        </form>
        <a class="auth-switch" :href="currentPage === 'signup' ? '#/signin' : '#/signup'" @click.prevent="openAuthPage(currentPage === 'signup' ? 'signin' : 'signup')">
          {{ currentPage === 'signup' ? 'Already have an account? Sign in' : 'New here? Create an account' }}
        </a>
      </div>
    </section>
</template>

<script setup>
import { inject } from 'vue'
const { currentPage, authForm, authError, submitAuthForm, openAuthPage } = inject('page-context')
</script>
