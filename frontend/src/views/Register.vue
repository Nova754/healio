<template>
    <ion-page>
      <ion-header :translucent="true">
        <ion-toolbar>
          <ion-title>Inscription</ion-title>
        </ion-toolbar>
      </ion-header>
  
      <ion-content class="ion-padding">
        <ion-card>
          <ion-card-header>
            <ion-card-title>Créer un compte</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-input v-model="firstName" type="text" label="Prénom" placeholder="Entrez votre prénom"></ion-input>
            <ion-input v-model="lastName" type="text" label="Nom" placeholder="Entrez votre nom"></ion-input>
            <ion-input v-model="email" type="email" label="Email" placeholder="Entrez votre email"></ion-input>
            <ion-input v-model="password" type="password" label="Mot de passe" placeholder="Choisissez un mot de passe"></ion-input>
            <ion-input v-model="confirmPassword" type="password" label="Confirmer le mot de passe" placeholder="Confirmez votre mot de passe"></ion-input>
  
            <ion-button expand="full" @click="register">S'inscrire</ion-button>
            <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
            <p v-if="successMessage" class="success">{{ successMessage }}</p>
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
  
  const firstName = ref('');
  const lastName = ref('');
  const email = ref('');
  const password = ref('');
  const confirmPassword = ref('');
  const errorMessage = ref('');
  const successMessage = ref('');
  const router = useRouter();
  
  const register = async () => {
    errorMessage.value = '';
    successMessage.value = '';
  
    if (!firstName.value || !lastName.value || !email.value || !password.value || !confirmPassword.value) {
      errorMessage.value = 'Veuillez remplir tous les champs';
      return;
    }
  
    if (password.value !== confirmPassword.value) {
      errorMessage.value = 'Les mots de passe ne correspondent pas';
      return;
    }
  
    try {
      const response = await axios.post('http://localhost:8081/api/register', {
        firstName: firstName.value,
        lastName: lastName.value,
        email: email.value,
        password: password.value
      });
  
      successMessage.value = "Inscription réussie ! Redirection...";
      
      setTimeout(() => {
        router.push('/login'); // Redirige vers la page de connexion après l'inscription
      }, 2000);
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      errorMessage.value = "Cet email est déjà utilisé ou une erreur s'est produite.";
    }
  };
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