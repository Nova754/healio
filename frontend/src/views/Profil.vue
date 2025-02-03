<template>
  <ion-page>
    <Navbar />

    <ion-header>
      <ion-toolbar>
        <ion-title>Mon Profil</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-card v-if="user">
        <ion-card-header>
          <ion-card-title>Profil de {{ user.firstName }} {{ user.lastName }}</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-list>
            <ion-item>
              <ion-label>Nom :</ion-label>
              <ion-input v-model="user.firstName" type="text"></ion-input>
            </ion-item>
            <ion-item>
              <ion-label>Prénom :</ion-label>
              <ion-input v-model="user.lastName" type="text"></ion-input>
            </ion-item>
            <ion-item>
              <ion-label>Email :</ion-label>
              <ion-input v-model="user.email" type="email"></ion-input>
            </ion-item>
            <ion-item>
              <ion-label>Bio :</ion-label>
              <ion-textarea v-model="user.bio" placeholder="Ajoutez une biographie"></ion-textarea>
            </ion-item>
            <ion-item>
              <ion-label>Nouveau mot de passe :</ion-label>
              <ion-input v-model="password" type="password" placeholder="Laissez vide si inchangé"></ion-input>
            </ion-item>
          </ion-list>

          <ion-button expand="full" @click="updateProfile">Modifier</ion-button>
          <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
          <p v-if="successMessage" class="success">{{ successMessage }}</p>
        </ion-card-content>
      </ion-card>
      
      <ion-spinner v-else></ion-spinner>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, 
  IonCardHeader, IonCardTitle, IonCardContent, IonList, IonItem, 
  IonLabel, IonInput, IonTextarea, IonButton, IonSpinner 
} from '@ionic/vue';
import axios from 'axios';
import Navbar from '@/components/Navbar.vue';

const user = ref<any>(null);
const password = ref('');
const errorMessage = ref('');
const successMessage = ref('');
const router = useRouter();

const fetchUserProfile = async () => {
  const storedUser = JSON.parse(localStorage.getItem('user'));
  if (!storedUser || !storedUser.id) {
    errorMessage.value = "Vous devez être connecté.";
    return;
  }

  try {
    const response = await axios.get(`http://localhost:8081/api/users/${storedUser.id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });

    user.value = response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération du profil:", error);
    errorMessage.value = "Impossible de récupérer le profil.";
  }
};

const updateProfile = async () => {
  if (!user.value) return;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(user.value.email)) {
    errorMessage.value = "L'email est invalide.";
    return;
  }

  const updates = {
    firstName: user.value.firstName.trim(),
    lastName: user.value.lastName.trim(),
    email: user.value.email.trim(),
    bio: user.value.bio ? user.value.bio.trim() : null,
  };

  if (password.value.trim()) {
    if (password.value.length < 6) {
      errorMessage.value = "Le mot de passe doit contenir au moins 6 caractères.";
      return;
    }
    updates.password = password.value;
  }

  console.log("Données envoyées :", updates); // 🔍 Debugging

  try {
    const response = await axios.patch(`http://localhost:8081/api/users/${user.value.id}`, updates, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' }
    });

    console.log("Réponse du serveur :", response.data);
    successMessage.value = "Profil mis à jour avec succès!";
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil:", error.response?.data || error.message);
    errorMessage.value = "Erreur lors de la mise à jour.";
  }
};

// ✅ Charger les infos au montage
onMounted(fetchUserProfile);
</script>
