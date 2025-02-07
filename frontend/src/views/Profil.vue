<template>
  <ion-page>
    <Navbar2 />

    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="end">
          <ion-button @click="goToSettings">
            <ion-icon :icon="settingsOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>Mon Profil</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <template v-if="user">
        <ion-card>
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

            <ion-button expand="full" @click="updateProfile" class="profil-modif">Modifier</ion-button>
            <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
            <p v-if="successMessage" class="success">{{ successMessage }}</p>
          </ion-card-content>
        </ion-card>

        <ion-card>
          <ion-card-header>
            <ion-card-title>🏅 Badges obtenus</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-list v-if="badgesObtained.length > 0">
              <ion-item v-for="badge in badgesObtained" :key="badge.id">
                <ion-thumbnail slot="start">
                  <img :src="badge.image" :alt="badge.name" />
                </ion-thumbnail>
                <ion-label>
                  <strong>{{ badge.name }}</strong>
                  <p>{{ badge.description }}</p>
                </ion-label>
              </ion-item>
            </ion-list>
            <p v-else>Aucun badge obtenu pour le moment.</p>
          </ion-card-content>
        </ion-card>

        <ion-card>
          <ion-card-header>
            <ion-card-title>🎖️ Tous les badges disponibles</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-list v-if="allBadges.length > 0">
              <ion-item v-for="badge in allBadges" :key="badge.id">
                <ion-thumbnail slot="start">
                  <img :src="badge.image" :alt="badge.name" />
                </ion-thumbnail>
                <ion-label>
                  <strong>{{ badge.name }}</strong>
                  <p>{{ badge.description }}</p>
                </ion-label>
              </ion-item>
            </ion-list>
            <p v-else>Chargement des badges...</p>
          </ion-card-content>
        </ion-card>
      </template>

      <ion-spinner v-else></ion-spinner>
    </ion-content>

    <ion-footer>
      <ion-toolbar>
        <Navbar />
      </ion-toolbar>
    </ion-footer>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, 
  IonCardHeader, IonCardTitle, IonCardContent, IonList, IonItem, 
  IonLabel, IonInput, IonTextarea, IonButton, IonSpinner, IonThumbnail, IonIcon, IonButtons 
} from '@ionic/vue';
import { settingsOutline } from 'ionicons/icons';
import axios from 'axios';
import Navbar from '@/components/Navbar.vue';
import Navbar2 from '@/components/Navbar2.vue';

const user = ref<any>(null);
const password = ref('');
const badgesObtained = ref<any[]>([]);
const allBadges = ref<any[]>([]);
const errorMessage = ref('');
const successMessage = ref('');
const router = useRouter();

const goToSettings = () => {
  router.push('/settings');
};

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
    await fetchUserBadges(storedUser.id);
    await fetchAllBadges();
  } catch (error) {
    console.error("Erreur lors de la récupération du profil:", error);
    errorMessage.value = "Impossible de récupérer le profil.";
  }
};

const fetchUserBadges = async (userId: number) => {
  try {
    const response = await axios.get(`http://localhost:8081/api/badges/user/${userId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    badgesObtained.value = response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des badges :", error);
  }
};

const fetchAllBadges = async () => {
  try {
    const response = await axios.get(`http://localhost:8081/api/badges`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    allBadges.value = response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération de tous les badges :", error);
  }
};

const updateProfile = async () => {
  if (!user.value) return;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(user.value.email)) {
    errorMessage.value = "L'email est invalide.";
    return;
  }

  const updates: any = {
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

  console.log("Données envoyées :", updates);

  try {
    await axios.patch(`http://localhost:8081/api/users/${user.value.id}`, updates, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' }
    });
    successMessage.value = "Profil mis à jour avec succès!";
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil:", error);
    errorMessage.value = "Erreur lors de la mise à jour.";
  }
};

onMounted(fetchUserProfile);
</script>
