<template>
  <ion-header>
    <ion-toolbar class="ion-padding-horizontal">
      <ion-title>HEALIO</ion-title>
      <ion-buttons slot="end">
        <ion-button v-if="showCloseButton" @click="closePage">
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