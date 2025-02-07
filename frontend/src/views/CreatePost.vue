<template>
  <ion-page>
    <Navbar2 />
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
          <ion-input
            v-model="title"
            label="Titre"
            placeholder="Entrez le titre de la publication">
          </ion-input>
          
          <ion-input
            v-model="content"
            type="text"
            label="Contenu"
            placeholder="Écrivez votre publication...">
          </ion-input>

          <ion-button expand="full" @click="createPost">Publier</ion-button>
          <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
          <p v-if="successMessage" class="success">{{ successMessage }}</p>
        </ion-card-content>
      </ion-card>
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
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonInput, IonButton, IonFooter } from '@ionic/vue';
import axios from 'axios';
import Navbar2 from '@/components/Navbar2.vue';
import Navbar from '@/components/Navbar.vue';

const title = ref('');
const content = ref('');
const imagesFiles = ref<File[]>([]);
const errorMessage = ref('');
const successMessage = ref('');
const router = useRouter();

const userId = ref<number | null>(null);
const fetchUserId = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (user && user.id) {
      userId.value = user.id;
    } else {
      errorMessage.value = "Vous devez être connecté pour publier.";
    }
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);
    errorMessage.value = "Erreur d'authentification.";
  }
};

const handleImagesUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    imagesFiles.value = Array.from(target.files);
    console.log("Fichiers sélectionnés :", imagesFiles.value.map(file => file.name));
  }
};

const createPost = async () => {
  errorMessage.value = '';
  successMessage.value = '';

  if (!userId.value) {
    errorMessage.value = "Vous devez être connecté pour publier.";
    return;
  }
  if (!title.value.trim()) {
    errorMessage.value = "Le titre est obligatoire.";
    return;
  }
  if (!content.value.trim()) {
    errorMessage.value = "Le contenu ne peut pas être vide.";
    return;
  }

  const imagesNames = imagesFiles.value.map(file => file.name);
  
  const postData = {
    userId: userId.value,
    title: title.value.trim(),
    content: content.value.trim(),
    images: imagesNames.length ? JSON.stringify(imagesNames) : null
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
  } catch (error: any) {
    console.error("Erreur lors de la création de la publication :", error.response?.data || error.message);
    errorMessage.value = error.response?.data?.message || "Une erreur s'est produite.";
  }
};

onMounted(fetchUserId);
</script>