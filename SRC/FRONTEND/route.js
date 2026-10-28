import { createRouter, createWebHashHistory } from 'vue-router'
import HomePage from './pages/main.vue'
import RecipesPage from './pages/recipe.vue'
import AlbumsPage from './pages/album.vue'
import UsersPage from './pages/users.vue'

export default createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: HomePage },
    { path: '/recipes', name: 'recipes', component: RecipesPage },
    { path: '/albums', name: 'albums', component: AlbumsPage },
    { path: '/members', name: 'members', component: UsersPage },
    { path: '/sign-up', name: 'sign-up', component: UsersPage },
  ],
})
