import { createApp } from 'vue'
import App from './src/index.vue'
import router from './router.js'
import { initializeAuth } from './auth.js'

initializeAuth()
createApp(App).use(router).mount('#app')
