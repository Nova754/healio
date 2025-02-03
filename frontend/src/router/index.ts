import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import HomePage from '../views/HomePage.vue';
import LoginPage from '../views/Login.vue';
import RegisterPage from '../views/Register.vue';
import CreatePostPage from '../views/CreatePost.vue';
import ProfilPage from '../views/Profil.vue';

const routes: Array<RouteRecordRaw> = [
  { path: '/', redirect: '/home' },
  { path: '/home', name: 'Home', component: HomePage },
  { path: '/login', name: 'Login', component: LoginPage },
  { path: '/register', name: 'Register', component: RegisterPage },
  { path: '/logout', 
    name: 'Logout',
    redirect: '/login',
    beforeEnter: (to, from, next) => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      next();
    }
  },
  { path: '/create-post', name: 'CreatePost', component: CreatePostPage },
  { path: '/profile', name: 'Profil', component: ProfilPage }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

export default router;
