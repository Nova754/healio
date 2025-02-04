<template>
    <ion-header>
      <ion-toolbar>
        <ion-title>HEALIO</ion-title>
        <ion-buttons slot="end" v-if="showCloseButton">
          <ion-button @click="closePage">
            <ion-icon :icon="closeIcon"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { close } from 'ionicons/icons';
  
  const route = useRoute();
  const router = useRouter();
  
  const showCloseButton = computed(() => {
    if (route.name === 'Home') return false;
    return true;
  });
  
  const closeIcon = close;
  
  const closePage = () => {
    router.back();
  };
  </script>
  
  <style scoped>
  @import url('https://fonts.googleapis.com/css2?family=Raleway&display=swap');
  
  /* Fond de la navbar et éléments */
  ion-header,
  ion-toolbar {
    background-color: #192945;
    font-family: 'Raleway', sans-serif;
    color: #D3DCF1;
  }
  
  ion-title {
    font-weight: bold;
  }
  
  ion-button {
    --background: transparent;
    color: #D3DCF1;
  }
  </style>
  