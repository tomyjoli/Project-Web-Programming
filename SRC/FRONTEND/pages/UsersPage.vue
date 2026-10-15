<template>
  <section class="detail-page users-page">
    <div class="section-heading">
      <div>
        <p class="eyebrow">Meet the community</p>
        <h1>Users</h1>
        <p class="section-copy">Browse the people behind the Banana Split community.</p>
      </div>
      <span class="recipe-count">{{ filteredUsers.length }} users</span>
    </div>
    <label class="search-bar users-search" for="user-search">
      <span aria-hidden="true">⌕</span>
      <input
        id="user-search"
        type="search"
        placeholder="Search by username, email or bio..."
        :value="userSearchQuery"
        @input="$emit('update:user-search-query', $event.target.value)"
      />
      <button v-if="userSearchQuery" type="button" @click="$emit('update:user-search-query', '')">Clear</button>
    </label>
    <div v-if="filteredUsers.length" class="users-grid">
      <a
        v-for="user in filteredUsers"
        :key="user.user_id"
        class="user-card"
        :href="userProfileHref(user)"
        @click.prevent="$emit('open-user', user)"
      >
        <span class="user-avatar" aria-hidden="true">{{ user.username.slice(0, 1).toUpperCase() }}</span>
        <span class="user-card-copy">
          <strong>{{ user.username }}</strong>
          <span>{{ user.bio || 'No description provided.' }}</span>
        </span>
        <span class="row-arrow" aria-hidden="true">→</span>
      </a>
    </div>
    <p v-else class="empty-state">No users match your search. Try another name or email.</p>
  </section>
</template>

<script setup>
defineProps({
  filteredUsers: { type: Array, required: true },
  userSearchQuery: { type: String, required: true },
  userProfileHref: { type: Function, required: true },
})

defineEmits(['update:user-search-query', 'open-user'])
</script>
