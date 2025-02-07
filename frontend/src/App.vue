<template>
  <ion-router-outlet />
</template>

<script setup>
import { IonRouterOutlet } from '@ionic/vue';
import { watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const applyTheme = (theme) => {
const link = document.getElementById("theme-style");
if (!link) {
  const newLink = document.createElement("link");
  newLink.id = "theme-style";
  newLink.rel = "stylesheet";
  newLink.href = theme;
  document.head.appendChild(newLink);
} else {
  link.href = theme;
}
};

watch(route, (to) => {
if (["/login", "/register", "/profil", "/create-post"].includes(to.path)) {
  applyTheme("/src/theme/themeauth.css");
} else if (to.path === "/home") {
  applyTheme("/src/theme/themehome.css");
} else if (to.path === "/admindashboard") {
  applyTheme("/src/theme/themedashboard.css");
}
});

onMounted(() => {
if (["/login", "/register", "/profil", "/create-post"].includes(route.path)) {
  applyTheme("/src/theme/themeauth.css");
} else if (route.path === "/home") {
  applyTheme("/src/theme/themehome.css");
} else if (route.path === "/admindashboard") {
  applyTheme("/src/theme/themedashboard.css");
}
});
</script>
