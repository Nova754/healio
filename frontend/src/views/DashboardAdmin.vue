<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Dashboard Administrateur - Gestion des Utilisateurs</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
    
      <ion-spinner v-if="loading" />

      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      <p v-if="successMessage" class="success">{{ successMessage }}</p>

      <ion-list v-if="!loading">
        <ion-item v-for="user in users" :key="user.id">
          <ion-label class="ion-text-wrap">
            <h2>{{ user.firstName }} {{ user.lastName }}</h2>
            <p>Email : {{ user.email }}</p>
            <p>Rôle : {{ user.role }}</p>
            <p v-if="user.bio">Bio : {{ user.bio }}</p>
          </ion-label>
          <ion-button @click="selectUser(user)" fill="outline" size="small">Editer</ion-button>
          <ion-button @click="deleteUser(user.id)" fill="outline" color="danger" size="small">Supprimer</ion-button>
        </ion-item>
      </ion-list>

      <ion-modal v-model:isOpen="isModalOpen">
        <ion-header>
          <ion-toolbar>
            <ion-title>Editer l'utilisateur</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="closeEdit">Fermer</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <ion-item>
            <ion-label position="floating">Prénom</ion-label>
            <ion-input v-model="selectedUser.firstName"></ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="floating">Nom</ion-label>
            <ion-input v-model="selectedUser.lastName"></ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="floating">Email</ion-label>
            <ion-input v-model="selectedUser.email" type="email"></ion-input>
          </ion-item>
          <ion-item>
            <ion-label position="floating">Bio</ion-label>
            <ion-textarea v-model="selectedUser.bio"></ion-textarea>
          </ion-item>
          <ion-item>
            <ion-label>Rôle</ion-label>
            <ion-select v-model="selectedUser.role">
              <ion-select-option value="admin">Admin</ion-select-option>
              <ion-select-option value="researcher">Chercheur</ion-select-option>
              <ion-select-option value="user">Utilisateur</ion-select-option>
            </ion-select>
          </ion-item>
          <ion-button expand="full" @click="updateUser">Enregistrer les modifications</ion-button>
        </ion-content>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonModal,
  IonSpinner
} from '@ionic/vue';
import axios from 'axios';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  bio?: string;
  role: 'admin' | 'researcher' | 'user';
  created_at?: string;
}

const router = useRouter();

const users = ref<User[]>([]);
const loading = ref<boolean>(false);
const errorMessage = ref<string>('');
const successMessage = ref<string>('');
const selectedUser = ref<User | null>(null);
const isModalOpen = ref<boolean>(false);


const checkAdmin = () => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    const user = JSON.parse(storedUser);
    if (user.role !== 'admin') {
      router.push('/home');
    }
  } else {
    router.push('/login');
  }
};


const fetchUsers = async () => {
  loading.value = true;
  errorMessage.value = '';
  try {
    const response = await axios.get('http://localhost:8081/api/users', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    users.value = response.data;
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || 'Erreur lors du chargement des utilisateurs.';
  } finally {
    loading.value = false;
  }
};


const deleteUser = async (userId: number) => {
  errorMessage.value = '';
  successMessage.value = '';
  try {
    await axios.delete(`http://localhost:8081/api/users/${userId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    successMessage.value = 'Utilisateur supprimé avec succès.';
    await fetchUsers();
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || 'Erreur lors de la suppression de l\'utilisateur.';
  }
};


const selectUser = (user: User) => {
  selectedUser.value = { ...user }; // Copie pour éviter de modifier directement la liste affichée
  isModalOpen.value = true;
};


const closeEdit = () => {
  isModalOpen.value = false;
  selectedUser.value = null;
};


const updateUser = async () => {
  if (!selectedUser.value) return;
  errorMessage.value = '';
  successMessage.value = '';
  try {
    // Exclure les propriétés non modifiables
    const { id, created_at, ...updates } = selectedUser.value;
    await axios.patch(`http://localhost:8081/api/users/${selectedUser.value.id}`, updates, {
      headers: { 
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    successMessage.value = 'Utilisateur mis à jour avec succès.';
    await fetchUsers();
    closeEdit();
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || 'Erreur lors de la mise à jour de l\'utilisateur.';
  }
};

onMounted(() => {
  checkAdmin();
  fetchUsers();
});
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
