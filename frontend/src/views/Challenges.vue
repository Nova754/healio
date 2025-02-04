<template>
    <ion-page>
      <navbar2 />
      <ion-header>
        <ion-toolbar>
          <ion-title>Challenges</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <ion-list v-if="challenges.length">
          <ion-card v-for="challenge in challenges" :key="challenge.id">
            <ion-card-header>
              <ion-card-title>{{ challenge.title }}</ion-card-title>
              <ion-card-subtitle>
                Début : {{ formatDate(challenge.start_date) }}
                <span v-if="challenge.end_date">
                  - Fin : {{ formatDate(challenge.end_date) }}
                </span>
              </ion-card-subtitle>
            </ion-card-header>
            <ion-card-content>
              <p>{{ challenge.description }}</p>
            </ion-card-content>
          </ion-card>
        </ion-list>
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
  import Navbar2 from '@/components/Navbar2.vue';
  import Navbar from '@/components/Navbar.vue';
  import { ref, onMounted } from 'vue';
  import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonSpinner } from '@ionic/vue';
  import axios from 'axios';
  
  interface Challenge {
    id: number;
    title: string;
    description: string;
    start_date: string;
    end_date?: string | null;
  }
  
  const challenges = ref<Challenge[]>([]);
  
  const fetchChallenges = async () => {
    try {
      const response = await axios.get('http://localhost:8081/api/challenges', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      challenges.value = response.data;
    } catch (error) {
      console.error('Erreur lors du chargement des challenges:', error);
    }
  };
  
  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString();
  };
  
  onMounted(() => {
    fetchChallenges();
  });
  </script>