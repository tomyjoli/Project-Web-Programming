import { createRouter, createWebHashHistory } from 'vue-router'
import HomePage from './pages/main.vue'
import RecipesPage from './pages/recipe.vue'
import AlbumsPage from './pages/album.vue'
import UsersPage from './pages/users.vue'
import IngredientsPage from './pages/ingredient.vue'
import SharePage from './pages/share.vue'

export default createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: HomePage, alias: '/main' },
    { path: '/recipes', name: 'recipes', component: RecipesPage },
    { path: '/albums', name: 'albums', component: AlbumsPage },
    { path: '/members', name: 'members', component: UsersPage, alias: '/users' },
    { path: '/ingredients', name: 'ingredients', component: IngredientsPage },
    { path: '/share', name: 'share', component: SharePage },
    { path: '/sign-up', name: 'sign-up', component: UsersPage },
  ],
})
