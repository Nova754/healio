<template>
  <ion-page>
    <Navbar2 />

    <ion-content class="ion-padding">
      <ion-card>
        <ion-card-header>
          <ion-card-title>Créer un compte</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-input
            v-model="firstName"
            type="text"
            label="Prénom"
            placeholder="Entrez votre prénom">
          </ion-input>
          <ion-input
            v-model="lastName"
            type="text"
            label="Nom"
            placeholder="Entrez votre nom">
          </ion-input>
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
            placeholder="Choisissez un mot de passe">
          </ion-input>
          <ion-input
            v-model="confirmPassword"
            type="password"
            label="Confirmer le mot de passe"
            placeholder="Confirmez">
          </ion-input>

          <ion-button expand="full" @click="register">S'inscrire</ion-button>

          <div class="login-link">
            <p>Déjà un compte ?</p>
            <ion-button fill="clear" @click="goToLogin" color="primary">
              Se connecter
            </ion-button>
          </div>
        </ion-card-content>
      </ion-card>
    </ion-content>

    <div v-if="showErrorAlert" class="error-alert">
      <img src="@/assets/robotalerte.png" alt="Erreur d'inscription" />
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

const firstName = ref('');
const lastName = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const errorMessage = ref('');
const showErrorAlert = ref(false);
const successMessage = ref('');
const router = useRouter();

const register = async () => {
  errorMessage.value = '';
  successMessage.value = '';
  showErrorAlert.value = false;

  if (!firstName.value || !lastName.value || !email.value || !password.value || !confirmPassword.value) {
    errorMessage.value = '❌ Veuillez remplir tous les champs !';
    showErrorAlert.value = true;
    setTimeout(() => { showErrorAlert.value = false; }, 4000);
    return;
  }

  if (password.value !== confirmPassword.value) {
    errorMessage.value = '⚠️ Les mots de passe ne correspondent pas !';
    showErrorAlert.value = true;
    setTimeout(() => { showErrorAlert.value = false; }, 4000);
    return;
  }

  try {
    const response = await axios.post('http://localhost:8081/api/register', {
      firstName: firstName.value,
      lastName: lastName.value,
      email: email.value,
      password: password.value
    });

    successMessage.value = "✅ Inscription réussie ! Redirection...";
    setTimeout(() => {
      router.push('/login'); 
    }, 2000);
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    errorMessage.value = "⚠️ Cet email est déjà utilisé ou une erreur s'est produite.";
    showErrorAlert.value = true;
    setTimeout(() => { showErrorAlert.value = false; }, 4000);
  }
};

const goToLogin = () => {
  router.push('/login');
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
</style><template>
  <ion-page>
    <Navbar2 />

    <ion-content class="ion-padding">
      <ion-card>
        <ion-card-header>
          <ion-card-title>Créer un compte</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-input
            v-model="firstName"
            type="text"
            label="Prénom"
            placeholder="Entrez votre prénom">
          </ion-input>
          <ion-input
            v-model="lastName"
            type="text"
            label="Nom"
            placeholder="Entrez votre nom">
          </ion-input>
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
            placeholder="Choisissez un mot de passe">
          </ion-input>
          <ion-input
            v-model="confirmPassword"
            type="password"
            label="Confirmer le mot de passe"
            placeholder="Confirmez">
          </ion-input>

          <ion-button expand="full" @click="register">S'inscrire</ion-button>

          <div class="login-link">
            <p>Déjà un compte ?</p>
            <ion-button fill="clear" @click="goToLogin" color="primary">
              Se connecter
            </ion-button>
          </div>
        </ion-card-content>
      </ion-card>
    </ion-content>

    <div v-if="showErrorAlert" class="error-alert">
      <img src="@/assets/robotalerte.png" alt="Erreur d'inscription" />
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

const firstName = ref('');
const lastName = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const errorMessage = ref('');
const showErrorAlert = ref(false);
const successMessage = ref('');
const router = useRouter();

const register = async () => {
  errorMessage.value = '';
  successMessage.value = '';
  showErrorAlert.value = false;

  if (!firstName.value || !lastName.value || !email.value || !password.value || !confirmPassword.value) {
    errorMessage.value = '❌ Veuillez remplir tous les champs !';
    showErrorAlert.value = true;
    setTimeout(() => { showErrorAlert.value = false; }, 4000);
    return;
  }

  if (password.value !== confirmPassword.value) {
    errorMessage.value = '⚠️ Les mots de passe ne correspondent pas !';
    showErrorAlert.value = true;
    setTimeout(() => { showErrorAlert.value = false; }, 4000);
    return;
  }

  try {
    const response = await axios.post('http://localhost:8081/api/register', {
      firstName: firstName.value,
      lastName: lastName.value,
      email: email.value,
      password: password.value
    });

    successMessage.value = "✅ Inscription réussie ! Redirection...";
    setTimeout(() => {
      router.push('/login'); 
    }, 2000);
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    errorMessage.value = "⚠️ Cet email est déjà utilisé ou une erreur s'est produite.";
    showErrorAlert.value = true;
    setTimeout(() => { showErrorAlert.value = false; }, 4000);
  }
};

const goToLogin = () => {
  router.push('/login');
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
