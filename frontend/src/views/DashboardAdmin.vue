<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Dashboard Administrateur</ion-title>
      </ion-toolbar>
      <ion-segment v-model="selectedSegment">
        <ion-segment-button value="users">Utilisateurs</ion-segment-button>
        <ion-segment-button value="posts">Posts</ion-segment-button>
        <ion-segment-button value="badges">Badges</ion-segment-button>
        <ion-segment-button value="challenges">Challenges</ion-segment-button>
      </ion-segment>
    </ion-header>
    <ion-content class="ion-padding">
      <div v-if="selectedSegment === 'users'">
        <h2>Gestion des Utilisateurs</h2>
        <ion-button expand="full" @click="openUserCreateModal">Ajouter un utilisateur</ion-button>
        <ion-list v-if="users.length">
          <ion-item v-for="userItem in users" :key="userItem.id">
            <ion-label class="ion-text-wrap">
              <h2>{{ userItem.firstName }} {{ userItem.lastName }}</h2>
              <p>Email : {{ userItem.email }}</p>
              <p>Rôle : {{ userItem.role }}</p>
              <p v-if="userItem.bio">Bio : {{ userItem.bio }}</p>
            </ion-label>
            <ion-button @click="selectUser(userItem)" fill="outline" size="small">Éditer</ion-button>
            <ion-button @click="deleteUser(userItem.id)" fill="outline" color="danger" size="small">Supprimer</ion-button>
          </ion-item>
        </ion-list>
        <ion-spinner v-else></ion-spinner>
      </div>
      <div v-if="selectedSegment === 'posts'">
        <h2>Gestion des Posts</h2>
        <ion-list v-if="paginatedPosts.length">
          <ion-item v-for="post in paginatedPosts" :key="post.id">
            <ion-label>
              <h2>{{ post.title }}</h2>
              <p>Par : {{ post.firstName }} {{ post.lastName }}</p>
              <p>Date : {{ formatDate(post.created_at) }}</p>
              <p>{{ truncateContent(post.content) }}</p>
            </ion-label>
            <ion-button @click="selectPost(post)" fill="outline" size="small">Éditer</ion-button>
            <ion-button @click="deletePost(post.id)" fill="outline" color="danger" size="small">Supprimer</ion-button>
          </ion-item>
        </ion-list>
        <ion-spinner v-else></ion-spinner>
        <div class="pagination-controls" style="display: flex; justify-content: space-between; margin-top: 16px;">
          <ion-button @click="prevPage" :disabled="currentPage === 1">Précédent</ion-button>
          <span>Page {{ currentPage }} sur {{ totalPages }}</span>
          <ion-button @click="nextPage" :disabled="currentPage === totalPages">Suivant</ion-button>
        </div>
      </div>
      <div v-if="selectedSegment === 'badges'">
        <h2>Gestion des Badges</h2>
        <ion-button expand="full" @click="openBadgeCreateModal">Ajouter un badge</ion-button>
        <ion-list v-if="badges.length">
          <ion-item v-for="badge in badges" :key="badge.id">
            <ion-label>
              <h2>{{ badge.name }}</h2>
              <p>{{ badge.description }}</p>
              <p v-if="badge.icon_url">Icon URL : {{ badge.icon_url }}</p>
            </ion-label>
            <ion-button @click="selectBadge(badge)" fill="outline" size="small">Éditer</ion-button>
            <ion-button @click="deleteBadge(badge.id)" fill="outline" color="danger" size="small">Supprimer</ion-button>
          </ion-item>
        </ion-list>
        <ion-spinner v-else></ion-spinner>
      </div>
      <div v-if="selectedSegment === 'challenges'">
        <h2>Gestion des Challenges</h2>
        <ion-button expand="full" @click="openChallengeCreateModal">Ajouter un challenge</ion-button>
        <ion-list v-if="challenges.length">
          <ion-item v-for="challenge in challenges" :key="challenge.id">
            <ion-label>
              <h2>{{ challenge.title }}</h2>
              <p>{{ challenge.description }}</p>
              <p>Date de début : {{ formatDate(challenge.start_date) }}</p>
              <p v-if="challenge.end_date">Date de fin : {{ formatDate(challenge.end_date) }}</p>
            </ion-label>
            <ion-button @click="selectChallenge(challenge)" fill="outline" size="small">Éditer</ion-button>
            <ion-button @click="deleteChallenge(challenge.id)" fill="outline" color="danger" size="small">Supprimer</ion-button>
          </ion-item>
        </ion-list>
        <ion-spinner v-else></ion-spinner>
      </div>
    </ion-content>
    <ion-modal v-model:isOpen="isUserModalOpen">
      <ion-header>
        <ion-toolbar>
          <ion-title>Éditer l'utilisateur</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="closeUserModal">Fermer</ion-button>
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
        <ion-button expand="full" @click="updateUser">Enregistrer</ion-button>
      </ion-content>
    </ion-modal>
    <ion-modal v-model:isOpen="isUserCreateModalOpen">
      <ion-header>
        <ion-toolbar>
          <ion-title>Créer un nouvel utilisateur</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="closeUserCreateModal">Fermer</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <ion-item>
          <ion-label position="floating">Prénom</ion-label>
          <ion-input v-model="newUser.firstName"></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="floating">Nom</ion-label>
          <ion-input v-model="newUser.lastName"></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="floating">Email</ion-label>
          <ion-input v-model="newUser.email" type="email"></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="floating">Mot de passe</ion-label>
          <ion-input v-model="newUser.password" type="password"></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="floating">Bio</ion-label>
          <ion-textarea v-model="newUser.bio"></ion-textarea>
        </ion-item>
        <ion-item>
          <ion-label>Rôle</ion-label>
          <ion-select v-model="newUser.role">
            <ion-select-option value="admin">Admin</ion-select-option>
            <ion-select-option value="researcher">Chercheur</ion-select-option>
            <ion-select-option value="user">Utilisateur</ion-select-option>
          </ion-select>
        </ion-item>
        <ion-button expand="full" @click="createUser">Créer l'utilisateur</ion-button>
      </ion-content>
    </ion-modal>
    <ion-modal v-model:isOpen="isPostModalOpen">
      <ion-header>
        <ion-toolbar>
          <ion-title>Éditer le post</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="closePostModal">Fermer</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <ion-item>
          <ion-label position="floating">Titre</ion-label>
          <ion-input v-model="selectedPost.title"></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="floating">Contenu</ion-label>
          <ion-textarea v-model="selectedPost.content"></ion-textarea>
        </ion-item>
        <ion-button expand="full" @click="updatePost">Enregistrer</ion-button>
      </ion-content>
    </ion-modal>
    <ion-modal v-model:isOpen="isBadgeModalOpen">
      <ion-header>
        <ion-toolbar>
          <ion-title>Éditer le badge</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="closeBadgeModal">Fermer</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <ion-item>
          <ion-label position="floating">Nom</ion-label>
          <ion-input v-model="selectedBadge.name"></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="floating">Description</ion-label>
          <ion-textarea v-model="selectedBadge.description"></ion-textarea>
        </ion-item>
        <ion-item>
          <ion-label position="floating">Icon URL</ion-label>
          <ion-input v-model="selectedBadge.icon_url"></ion-input>
        </ion-item>
        <ion-button expand="full" @click="updateBadge">Enregistrer</ion-button>
      </ion-content>
    </ion-modal>
    <ion-modal v-model:isOpen="isBadgeCreateModalOpen">
      <ion-header>
        <ion-toolbar>
          <ion-title>Créer un nouveau badge</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="closeBadgeCreateModal">Fermer</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <ion-item>
          <ion-label position="floating">Nom</ion-label>
          <ion-input v-model="newBadge.name"></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="floating">Description</ion-label>
          <ion-textarea v-model="newBadge.description"></ion-textarea>
        </ion-item>
        <ion-item>
          <ion-label position="floating">Icon URL</ion-label>
          <ion-input v-model="newBadge.icon_url"></ion-input>
        </ion-item>
        <ion-button expand="full" @click="createBadge">Créer le badge</ion-button>
      </ion-content>
    </ion-modal>
    <ion-modal v-model:isOpen="isChallengeModalOpen">
      <ion-header>
        <ion-toolbar>
          <ion-title>Éditer le challenge</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="closeChallengeModal">Fermer</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <ion-item>
          <ion-label position="floating">Titre</ion-label>
          <ion-input v-model="selectedChallenge.title"></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="floating">Description</ion-label>
          <ion-textarea v-model="selectedChallenge.description"></ion-textarea>
        </ion-item>
        <ion-item>
          <ion-label position="floating">Date de début</ion-label>
          <ion-input v-model="selectedChallenge.start_date" type="datetime-local"></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="floating">Date de fin</ion-label>
          <ion-input v-model="selectedChallenge.end_date" type="datetime-local"></ion-input>
        </ion-item>
        <ion-button expand="full" @click="updateChallenge">Enregistrer</ion-button>
      </ion-content>
    </ion-modal>
    <ion-modal v-model:isOpen="isChallengeCreateModalOpen">
      <ion-header>
        <ion-toolbar>
          <ion-title>Créer un nouveau challenge</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="closeChallengeCreateModal">Fermer</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <ion-item>
          <ion-label position="floating">Titre</ion-label>
          <ion-input v-model="newChallenge.title"></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="floating">Description</ion-label>
          <ion-textarea v-model="newChallenge.description"></ion-textarea>
        </ion-item>
        <ion-item>
          <ion-label position="floating">Date de début</ion-label>
          <ion-input v-model="newChallenge.start_date" type="datetime-local"></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="floating">Date de fin</ion-label>
          <ion-input v-model="newChallenge.end_date" type="datetime-local"></ion-input>
        </ion-item>
        <ion-button expand="full" @click="createChallenge">Créer le challenge</ion-button>
      </ion-content>
    </ion-modal>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSegment,
  IonSegmentButton,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonSpinner,
  IonModal,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonButtons,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonRow
} from '@ionic/vue';
import axios from 'axios';
import { heartOutline, heart } from 'ionicons/icons';

const router = useRouter();
const selectedSegment = ref('users');

const users = ref([]);
const selectedUser = ref(null);
const isUserModalOpen = ref(false);
const isUserCreateModalOpen = ref(false);
const newUser = ref({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  bio: '',
  role: 'user'
});

const fetchUsers = async () => {
  try {
    const response = await axios.get('http://localhost:8081/api/users', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    users.value = response.data;
  } catch (error) {
    console.error('Erreur lors du chargement des utilisateurs:', error);
  }
};

const selectUser = (userItem) => {
  selectedUser.value = { ...userItem };
  isUserModalOpen.value = true;
};

const closeUserModal = () => {
  isUserModalOpen.value = false;
  selectedUser.value = null;
};

const updateUser = async () => {
  try {
    await axios.patch(`http://localhost:8081/api/users/${selectedUser.value.id}`, selectedUser.value, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    await fetchUsers();
    closeUserModal();
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
  }
};

const deleteUser = async (userId) => {
  try {
    await axios.delete(`http://localhost:8081/api/users/${userId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    await fetchUsers();
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur:", error);
  }
};

const openUserCreateModal = () => {
  newUser.value = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    bio: '',
    role: 'user'
  };
  isUserCreateModalOpen.value = true;
};

const closeUserCreateModal = () => {
  isUserCreateModalOpen.value = false;
};

const createUser = async () => {
  try {
    await axios.post('http://localhost:8081/api/users', newUser.value, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    await fetchUsers();
    closeUserCreateModal();
  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur:", error);
  }
};

const posts = ref([]);
const currentPage = ref(1);
const pageSize = 10;
const totalPages = computed(() => Math.ceil(posts.value.length / pageSize));
const paginatedPosts = computed(() =>
  posts.value.slice((currentPage.value - 1) * pageSize, currentPage.value * pageSize)
);

const selectedPost = ref(null);
const isPostModalOpen = ref(false);

const fetchPosts = async () => {
  try {
    const response = await axios.get('http://localhost:8081/api/posts', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    posts.value = response.data.map((post) => ({
      ...post,
      comments: [],
      showComments: false,
      likes: 0,
      likedByUser: false
    }));
    for (let post of posts.value) {
      await fetchLikesForPost(post.id);
    }
  } catch (error) {
    console.error("Erreur lors du chargement des posts:", error);
  }
};

const fetchLikesForPost = async (postId) => {
  try {
    const response = await axios.get(`http://localhost:8081/api/likes/${postId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    const post = posts.value.find(p => p.id === postId);
    if (post) {
      post.likes = response.data.length;
      post.likedByUser = response.data.some(like => like.user_id === JSON.parse(localStorage.getItem('user')).id);
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des likes pour le post:", error);
  }
};

const selectPost = (post) => {
  selectedPost.value = { ...post };
  fetchComments(post.id);
  isPostModalOpen.value = true;
};

const closePostModal = () => {
  isPostModalOpen.value = false;
  selectedPost.value = null;
};

const updatePost = async () => {
  try {
    await axios.patch(`http://localhost:8081/api/posts/${selectedPost.value.id}`, selectedPost.value, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    await fetchPosts();
    closePostModal();
  } catch (error) {
    console.error("Erreur lors de la mise à jour du post:", error);
  }
};

const deletePost = async (postId) => {
  try {
    await axios.delete(`http://localhost:8081/api/posts/${postId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    await fetchPosts();
  } catch (error) {
    console.error("Erreur lors de la suppression du post:", error);
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const truncateContent = (content) => {
  const maxLength = 150;
  return content.length <= maxLength ? content : content.substring(0, maxLength) + '...';
};

const formatDate = (date) => new Date(date).toLocaleDateString();

const toggleLike = async (postId) => {
  const post = posts.value.find(p => p.id === postId);
  if (!post) return;
  try {
    if (post.likedByUser) {
      await axios.delete('http://localhost:8081/api/likes', {
        data: { postId, userId: JSON.parse(localStorage.getItem('user')).id },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      post.likes = Math.max(post.likes - 1, 0);
      post.likedByUser = false;
    } else {
      await axios.post('http://localhost:8081/api/likes', { postId, userId: JSON.parse(localStorage.getItem('user')).id }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      post.likes++;
      post.likedByUser = true;
    }
  } catch (error) {
    console.error("Erreur lors du like du post:", error);
  }
};

const fetchComments = async (postId) => {
  try {
    const response = await axios.get(`http://localhost:8081/api/comments/${postId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    const post = posts.value.find(p => p.id === postId);
    if (post) {
      post.comments = response.data;
    }
  } catch (error) {
    console.error("Erreur lors du chargement des commentaires:", error);
  }
};

const badges = ref([]);
const selectedBadge = ref(null);
const isBadgeModalOpen = ref(false);
const isBadgeCreateModalOpen = ref(false);
const newBadge = ref({
  name: '',
  description: '',
  icon_url: ''
});

const fetchBadges = async () => {
  try {
    const response = await axios.get('http://localhost:8081/api/badges', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    badges.value = response.data;
  } catch (error) {
    console.error("Erreur lors du chargement des badges:", error);
  }
};

const selectBadge = (badge) => {
  selectedBadge.value = { ...badge };
  isBadgeModalOpen.value = true;
};

const closeBadgeModal = () => {
  isBadgeModalOpen.value = false;
  selectedBadge.value = null;
};

const updateBadge = async () => {
  try {
    await axios.patch(`http://localhost:8081/api/badges/${selectedBadge.value.id}`, selectedBadge.value, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    await fetchBadges();
    closeBadgeModal();
  } catch (error) {
    console.error("Erreur lors de la mise à jour du badge:", error);
  }
};

const deleteBadge = async (badgeId) => {
  try {
    await axios.delete(`http://localhost:8081/api/badges/${badgeId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    await fetchBadges();
  } catch (error) {
    console.error("Erreur lors de la suppression du badge:", error);
  }
};

const openBadgeCreateModal = () => {
  newBadge.value = {
    name: '',
    description: '',
    icon_url: ''
  };
  isBadgeCreateModalOpen.value = true;
};

const closeBadgeCreateModal = () => {
  isBadgeCreateModalOpen.value = false;
};

const createBadge = async () => {
  try {
    await axios.post('http://localhost:8081/api/badges', newBadge.value, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    await fetchBadges();
    closeBadgeCreateModal();
  } catch (error) {
    console.error("Erreur lors de la création du badge:", error);
  }
};

const challenges = ref([]);
const selectedChallenge = ref(null);
const isChallengeModalOpen = ref(false);
const isChallengeCreateModalOpen = ref(false);
const newChallenge = ref({
  title: '',
  description: '',
  start_date: '',
  end_date: ''
});

const fetchChallenges = async () => {
  try {
    const response = await axios.get('http://localhost:8081/api/challenges', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    challenges.value = response.data;
  } catch (error) {
    console.error("Erreur lors du chargement des challenges:", error);
  }
};

const selectChallenge = (challenge) => {
  selectedChallenge.value = { ...challenge };
  isChallengeModalOpen.value = true;
};

const closeChallengeModal = () => {
  isChallengeModalOpen.value = false;
  selectedChallenge.value = null;
};

const updateChallenge = async () => {
  try {
    await axios.patch(`http://localhost:8081/api/challenges/${selectedChallenge.value.id}`, selectedChallenge.value, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    await fetchChallenges();
    closeChallengeModal();
  } catch (error) {
    console.error("Erreur lors de la mise à jour du challenge:", error);
  }
};

const deleteChallenge = async (challengeId) => {
  try {
    await axios.delete(`http://localhost:8081/api/challenges/${challengeId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    await fetchChallenges();
  } catch (error) {
    console.error("Erreur lors de la suppression du challenge:", error);
  }
};

const openChallengeCreateModal = () => {
  newChallenge.value = {
    title: '',
    description: '',
    start_date: '',
    end_date: ''
  };
  isChallengeCreateModalOpen.value = true;
};

const closeChallengeCreateModal = () => {
  isChallengeCreateModalOpen.value = false;
};

const createChallenge = async () => {
  try {
    await axios.post('http://localhost:8081/api/challenges', newChallenge.value, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    await fetchChallenges();
    closeChallengeCreateModal();
  } catch (error) {
    console.error("Erreur lors de la création du challenge:", error);
  }
};

onMounted(async () => {
  await fetchUsers();
  await fetchPosts();
  await fetchBadges();
  await fetchChallenges();
});
</script>

<style scoped>
ion-segment {
  margin: 8px;
}
.pagination-controls {
  margin-top: 16px;
  text-align: center;
}
</style>