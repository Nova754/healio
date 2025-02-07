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

          <div class="register-link">
            <p>Vous n'êtes pas encore inscrit ?</p>
            <ion-button fill="clear" @click="goToRegister" color="primary">
              S'inscrire
            </ion-button>
          </div>
        </ion-card-content>
      </ion-card>
    </ion-content>

    <div v-if="showErrorAlert" class="error-alert">
      <img src="@/assets/robotalerte.png" alt="Erreur de connexion" />
      <div class="error-message">
        <p>{{ errorMessage }}</p>
      </div>
    </div>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { 
  IonPage, IonContent, IonCard, 
  IonCardHeader, IonCardTitle, IonCardContent, IonInput, IonButton
} from '@ionic/vue';
import axios from 'axios';
import Navbar2 from '@/components/Navbar2.vue';

const email = ref('');
const password = ref('');
const errorMessage = ref('');
const showErrorAlert = ref(false);
const router = useRouter();

const login = async () => {
  errorMessage.value = '';
  showErrorAlert.value = false;

  if (!email.value || !password.value) {
    errorMessage.value = '❌ Veuillez remplir tous les champs !';
    showErrorAlert.value = true;
    setTimeout(() => { showErrorAlert.value = false; }, 4000);
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
    errorMessage.value = "⚠️ Email ou mot de passe incorrect.";
    showErrorAlert.value = true;
    setTimeout(() => { showErrorAlert.value = false; }, 4000);
  }
};

const goToRegister = () => {
  router.push('/register');
};
</script>

<style scoped>
.error-alert {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: rgba(255, 69, 58, 0.95);
  color: white;
  padding: 15px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  animation: fadeIn 0.3s ease-in-out;
  font-size: 18px;
  max-width: 350px;
}

.error-alert img {
  width: 70px;
  height: 70px;
}

.error-message {
  font-weight: bold;
  text-align: left;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}
</style>
