<template>
  <section class="detail-page public-user-page">
    <a class="back-link" href="#/users" @click.prevent="$emit('back')">← Back to users</a>
    <article v-if="user" class="public-user-card">
      <div class="public-user-heading">
        <span class="user-avatar public-user-avatar" aria-hidden="true">{{ user.username.slice(0, 1).toUpperCase() }}</span>
        <div>
          <p class="eyebrow">Community member</p>
          <h1>{{ user.username }}</h1>
        </div>
      </div>
      <p class="public-user-bio">{{ user.bio || 'This user has not added a description yet.' }}</p>
      <dl class="public-user-details">
        <div>
          <dt>Email</dt>
          <dd><a :href="`mailto:${user.email}`">{{ user.email }}</a></dd>
        </div>
        <div>
          <dt>Date of birth</dt>
          <dd>{{ user.date_of_birth || 'Not provided' }}</dd>
        </div>
      </dl>
    </article>
    <div v-else class="not-found">
      <h1>User not found</h1>
      <p>This user may not exist in the community data.</p>
      <a class="create-button" href="#/users" @click.prevent="$emit('back')">Back to users</a>
    </div>
  </section>
</template>

<script setup>
defineProps({
  user: { type: Object, default: null },
})

defineEmits(['back'])
</script>
