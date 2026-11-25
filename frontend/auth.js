import { ref } from 'vue'
import { apiRequest } from './src/api.js'

export const currentUser = ref(null)
export const authInitialized = ref(false)
export const authError = ref('')
let initializationPromise

export function initializeAuth() {
  if (!initializationPromise) {
    initializationPromise = apiRequest('/authapi/me')
      .then(({ user }) => {
        currentUser.value = user
        authError.value = ''
      })
      .catch((error) => {
        authError.value = error.message
      })
      .finally(() => {
        authInitialized.value = true
      })
  }
  return initializationPromise
}

export async function signIn(credentials) {
  const { user } = await apiRequest('/authapi/login', {
    method: 'POST',
    body: credentials,
  })
  currentUser.value = user
  authError.value = ''
  authInitialized.value = true
  initializationPromise = Promise.resolve({ user })
  return user
}

export async function registerAccount(account) {
  const { user } = await apiRequest('/authapi/register', {
    method: 'POST',
    body: account,
  })
  currentUser.value = user
  authError.value = ''
  authInitialized.value = true
  initializationPromise = Promise.resolve({ user })
  return user
}

export async function signOut() {
  await apiRequest('/authapi/logout', { method: 'POST' })
  currentUser.value = null
  authError.value = ''
  initializationPromise = Promise.resolve({ user: null })
}

export function getUserInitials(username) {
  const words = username.trim().split(/\s+/).filter(Boolean)

  if (words.length > 1) {
    return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase()
  }

  return words[0]?.slice(0, 2).toUpperCase() ?? ''
}
