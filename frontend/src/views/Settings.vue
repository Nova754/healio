<template>
    <ion-page>
      <Navbar2 />
  
      <ion-header>
        <ion-toolbar>
          <ion-title>Vos Paramètres</ion-title>
        </ion-toolbar>
      </ion-header>
  
      <ion-content class="ion-padding">
        <ion-list>
          <ion-list-header>
            <ion-label>Paramètres</ion-label>
          </ion-list-header>
          <ion-item button router-link="/notifications">
            <ion-icon :icon="notificationsOutline" slot="start"></ion-icon>
            <ion-label>Notifications</ion-label>
          </ion-item>
          <ion-item button router-link="/accessibility">
            <ion-icon :icon="eyeOutline" slot="start"></ion-icon>
            <ion-label>Accessibilité</ion-label>
          </ion-item>
          <ion-item button router-link="/languages">
            <ion-icon :icon="languageOutline" slot="start"></ion-icon>
            <ion-label>Langues</ion-label>
          </ion-item>
  
          <ion-list-header>
            <ion-label>Support</ion-label>
          </ion-list-header>
          <ion-item button router-link="/contact">
            <ion-icon :icon="mailOutline" slot="start"></ion-icon>
            <ion-label>Contact</ion-label>
          </ion-item>
          <ion-item button router-link="/help">
            <ion-icon :icon="helpCircleOutline" slot="start"></ion-icon>
            <ion-label>Aide</ion-label>
          </ion-item>
  
          <ion-list-header>
            <ion-label>Droits</ion-label>
          </ion-list-header>
          <ion-item button router-link="/preferences">
            <ion-icon :icon="settingsOutline" slot="start"></ion-icon>
            <ion-label>Paramétrez vos choix</ion-label>
          </ion-item>
          <ion-item button router-link="/rights">
            <ion-icon :icon="shieldCheckmarkOutline" slot="start"></ion-icon>
            <ion-label>Exercez vos droits</ion-label>
          </ion-item>
          <ion-item button router-link="/profile-check">
            <ion-icon :icon="personOutline" slot="start"></ion-icon>
            <ion-label>Vérifiez votre profil</ion-label>
          </ion-item>
          <ion-item button router-link="/opposition">
            <ion-icon :icon="eyeOffOutline" slot="start"></ion-icon>
            <ion-label>Droit d'opposition - Mesure d'audience</ion-label>
          </ion-item>
          <ion-item button router-link="/privacy-policy">
            <ion-icon :icon="lockClosedOutline" slot="start"></ion-icon>
            <ion-label>Politique de protection des données</ion-label>
          </ion-item>
          <ion-item button router-link="/legal-notice">
            <ion-icon :icon="documentOutline" slot="start"></ion-icon>
            <ion-label>Mentions légales</ion-label>
          </ion-item>
          <ion-item button router-link="/terms">
            <ion-icon :icon="clipboardOutline" slot="start"></ion-icon>
            <ion-label>Conditions Générales d'Utilisation</ion-label>
          </ion-item>
          <ion-item button router-link="/cookies-policy">
            <ion-icon :icon="lockClosedOutline" slot="start"></ion-icon>
            <ion-label>Politique relative aux cookies</ion-label>
          </ion-item>
  
          <ion-item button color="danger" @click="logout">
            <ion-icon :icon="logOutOutline" slot="start"></ion-icon>
            <ion-label>Se déconnecter</ion-label>
          </ion-item>
          <ion-item button color="danger" @click="deleteAccount">
            <ion-icon :icon="trashOutline" slot="start"></ion-icon>
            <ion-label>Supprimer mon compte</ion-label>
          </ion-item>
        </ion-list>
      </ion-content>
      <ion-footer>
      <ion-toolbar>
        <Navbar />
      </ion-toolbar>
    </ion-footer>
    </ion-page>
  </template>
  
  <script setup lang="ts">
  import { useRouter } from 'vue-router';
  import { 
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonListHeader, 
    IonItem, IonLabel, IonIcon 
  } from '@ionic/vue';
  import { 
    notificationsOutline, eyeOutline, languageOutline, mailOutline, helpCircleOutline, 
    settingsOutline, shieldCheckmarkOutline, personOutline, eyeOffOutline, lockClosedOutline, 
    documentOutline, clipboardOutline, logOutOutline, trashOutline 
  } from 'ionicons/icons';
  import axios from 'axios';
  import Navbar2 from '@/components/Navbar2.vue';
  import Navbar from '@/components/Navbar.vue';

  const router = useRouter();
  
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };
  
  const deleteAccount = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.id) {
      console.error("Utilisateur non authentifié.");
      return;
    }
  
    if (!confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.")) {
      return;
    }
  
    try {
      await axios.delete(`http://localhost:8081/api/users/${user.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
  
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/register');
    } catch (error) {
      console.error("Erreur lors de la suppression du compte :", error);
    }
  };
  </script>
  