import { ref } from 'vue'

export const currentUser = ref(null)

export function createFrontendAccount(user) {
  currentUser.value = user
}

export function clearCurrentUser() {
  currentUser.value = null
}

export function getUserInitials(username) {
  const words = username.trim().split(/\s+/).filter(Boolean)

  if (words.length > 1) {
    return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase()
  }

  return words[0]?.slice(0, 2).toUpperCase() ?? ''
}
