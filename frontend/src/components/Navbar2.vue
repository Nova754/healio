<template>
  <ion-header>
    <ion-toolbar class="ion-padding-horizontal">
      <ion-title>
        <img src="@/assets/logo.png" alt="HEALIO Logo" class="logo">
      </ion-title>
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
  return route.name !== 'Home';
});

const closeIcon = close;

const closePage = () => {
  router.back();
};
</script>

<style scoped>
.logo {
  height: 40px;
  width: auto;
}
</style>
