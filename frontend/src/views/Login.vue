<template>
    <ion-page>
      <ion-header :translucent="true">
        <ion-toolbar>
          <ion-title>Connexion</ion-title>
        </ion-toolbar>
      </ion-header>
  
      <ion-content class="ion-padding">
        <ion-card>
          <ion-card-header>
            <ion-card-title>Se connecter</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-input v-model="email" type="email" label="Email" placeholder="Entrez votre email"></ion-input>
            <ion-input v-model="password" type="password" label="Mot de passe" placeholder="Entrez votre mot de passe"></ion-input>
  
            <ion-button expand="full" @click="login">Connexion</ion-button>
            <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
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
  </script>
  
  <style scoped>
 ion-content {
  --background: linear-gradient(to bottom, #1e3a8a, #050a30);
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

ion-card {
  width: 90%;
  max-width: 400px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
  padding: 20px;
}

ion-card-title {
  text-align: center;
  font-size: 1.5rem;
  font-weight: bold;
  color: #1e3a8a;
}

ion-input {
  --background: white;
  --border-radius: 8px;
  --padding-start: 15px;
  --padding-end: 15px;
  --box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
  margin-bottom: 15px;
}

ion-button {
  --background: #f97316;
  --border-radius: 8px;
  --box-shadow: 0px 4px 8px rgba(249, 115, 22, 0.5);
  font-weight: bold;
  margin-top: 10px;
}

ion-button:hover {
  --background: #d86012;
}

.error {
  color: red;
  text-align: center;
  font-size: 0.9rem;
  margin-top: 10px;
}

  </style>
  