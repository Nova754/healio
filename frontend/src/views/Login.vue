<template>
  <ion-page class="login-page">
    <Navbar2 />

    <ion-content class="ion-padding">
      <ion-card class="login-card">
        <ion-card-header>
          <ion-card-title>Se connecter</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-input
            v-model="email"
            type="email"
            label="Email"
            placeholder="Entrez votre email">
          </ion-input>
          <ion-input
            v-model="password"
            type="password"
            label="Mot de passe"
            placeholder="Entrez votre mot de passe">
          </ion-input>

          <ion-button expand="full" @click="login">Connexion</ion-button>
          <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

          <div class="register-link">
            <p>Vous n'êtes pas encore inscrit ?</p>
            <ion-button fill="clear" @click="goToRegister" color="primary" text-decoration="underline">
              S'inscrire
            </ion-button>
          </div>

        </ion-card-content>
      </ion-card>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, 
  IonCardHeader, IonCardTitle, IonCardContent, IonInput, IonButton 
} from '@ionic/vue';
import axios from 'axios';
import Navbar2 from '@/components/Navbar2.vue';

const email = ref('');
const password = ref('');
const errorMessage = ref('');
const router = useRouter();

const login = async () => {
  errorMessage.value = '';

  if (!email.value || !password.value) {
    errorMessage.value = 'Veuillez remplir tous les champs';
    return;
  }

  try {
    const response = await axios.post('http://localhost:8081/api/login', {
      email: email.value,
      password: password.value
    });

    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      router.push('/home'); 
    }
  } catch (error) {
    console.error('Erreur de connexion:', error);
    errorMessage.value = "Email ou mot de passe incorrect.";
  }
};

const goToRegister = () => {
  router.push('/register');
};
</script>
