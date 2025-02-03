<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Créer une publication</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-card>
        <ion-card-header>
          <ion-card-title>Nouvelle Publication</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-input v-model="userId" type="number" label="Votre ID Utilisateur" placeholder="Entrez votre ID"></ion-input>
          <ion-input v-model="content" type="text" label="Contenu" placeholder="Écrivez votre publication..."></ion-input>
          <input type="file" @change="handleFileUpload" accept="image/*" />
          <ion-button expand="full" @click="createPost">Publier</ion-button>
          <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
          <p v-if="successMessage" class="success">{{ successMessage }}</p>
        </ion-card-content>
      </ion-card>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, 
  IonCardHeader, IonCardTitle, IonCardContent, IonInput, IonButton 
} from '@ionic/vue';
import axios from 'axios';
import Navbar from '@/components/Navbar.vue';

const userId = ref<number | null>(null);
const content = ref('');
const mediaFile = ref<File | null>(null);
const errorMessage = ref('');
const successMessage = ref('');
const router = useRouter();

const fetchUserId = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.id) {
      userId.value = user.id;
      console.log("Utilisateur connecté, ID:", userId.value);
    } else {
      errorMessage.value = "Vous devez être connecté pour publier.";
    }
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);
    errorMessage.value = "Erreur d'authentification.";
  }
};

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    mediaFile.value = file;
    console.log("Fichier sélectionné:", file.name);
  }
};

const createPost = async () => {
  errorMessage.value = '';
  successMessage.value = '';

  if (!userId.value) {
    errorMessage.value = "Vous devez renseigner votre ID.";
    return;
  }

  if (!content.value.trim()) {
    errorMessage.value = 'Le contenu ne peut pas être vide.';
    return;
  }

  const postData = {
    userId: parseInt(userId.value), 
    content: content.value.trim(), 
    media: mediaFile.value ? mediaFile.value.name : null 
  };

  console.log("Données envoyées :", postData);

  try {
    const response = await axios.post('http://localhost:8081/api/posts', postData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });

    console.log("Réponse du serveur :", response.data);

    successMessage.value = 'Publication créée avec succès!';
    
    setTimeout(() => {
      router.push('/home');
    }, 2000);
  } catch (error) {
    console.error("Erreur lors de la création de la publication:", error.response?.data || error.message);
    errorMessage.value = error.response?.data?.message || "Une erreur s'est produite.";
  }
};

onMounted(fetchUserId);
</script>

<style scoped>
.error {
  color: red;
  text-align: center;
  margin-top: 10px;
}
.success {
  color: green;
  text-align: center;
  margin-top: 10px;
}
</style>
