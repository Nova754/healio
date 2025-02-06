<template>
  <ion-header v-if="showNavbar">
    <ion-toolbar class="navbar">
      <ion-buttons>
        <ion-button v-for="link in filteredLinks" :key="link.path" @click="navigateTo(link.path)">
          <ion-icon :icon="link.icon" slot="start"></ion-icon>
          {{ link.label }}
        </ion-button>
        <ion-button v-if="isAdmin" @click="navigateTo('/admindashboard')">
          Dashboard
        </ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon } from '@ionic/vue';
import { home, create, person, trophy, logOut, logIn, personAdd, settings } from 'ionicons/icons'; 

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
      { path: '/home', icon: home },
      { path: '/create-post', icon: create },
      { path: '/profile',  icon: person },
      { path: '/challenges',  icon: trophy },
      { path: '/logout',  icon: logOut, action: logout }
    ];
  } else {
    return [
      { path: '/home', icon: home },
      { path: '/login', label: 'Se connecter' },
      { path: '/register',  label: 'S\'inscrire' }
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
  --background: #192945;
  --color: white;
}
ion-button {
  color: white;
}
</style>
