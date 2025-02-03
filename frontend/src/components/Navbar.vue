<template>
  <ion-header v-if="showNavbar">
    <ion-toolbar>
      <ion-title>Healio</ion-title>
      <ion-buttons slot="end">
        <ion-button v-for="link in filteredLinks" :key="link.path" @click="navigateTo(link.path)">
          {{ link.label }}
        </ion-button>
        <ion-button v-if="isAdmin" @click="navigateTo('/admindashboard')">
          Dashboard Admin
        </ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton } from '@ionic/vue';

const router = useRouter();
const route = useRoute();
const isAuthenticated = ref(false);
const isAdmin = ref(false);

const checkAuth = () => {
  const token = localStorage.getItem('token');
  isAuthenticated.value = !!token;
  const user = localStorage.getItem('user');
  if (user) {
    const parsedUser = JSON.parse(user);
    isAdmin.value = parsedUser.role === 'admin';
  } else {
    isAdmin.value = false;
  }
};

const hiddenRoutes = ['/login', '/register'];
const showNavbar = computed(() => !hiddenRoutes.includes(route.path));

watch(route, checkAuth, { immediate: true });

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  isAuthenticated.value = false;
  router.push('/login');
};

const filteredLinks = computed(() => {
  if (isAuthenticated.value) {
    return [
      { path: '/home', label: 'Home' },
      { path: '/create-post', label: 'Créer une publication' },
      { path: '/profile', label: 'Mon Profil' },
      { path: '/challenges', label: 'Challenges' },
      { path: '/logout', label: 'Logout', action: logout }
    ];
  } else {
    return [
      { path: '/home', label: 'Home' },
      { path: '/login', label: 'Login' },
      { path: '/register', label: 'Register' }
    ];
  }
});

const navigateTo = (path) => {
  if (path === '/logout') {
    logout();
  } else {
    router.push(path);
  }
};

onMounted(checkAuth);
</script>

<style scoped>
ion-toolbar {
  --background: #3880ff;
  --color: white;
}
ion-button {
  color: white;
}
</style>
