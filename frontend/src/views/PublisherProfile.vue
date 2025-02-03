<template>
    <ion-page>
      <ion-header>
        <ion-toolbar>
          <ion-title>
            Profil de {{ userProfile.firstName }} {{ userProfile.lastName }}
          </ion-title>
        </ion-toolbar>
      </ion-header>
      
      <ion-content class="ion-padding">
        <ion-card>
          <ion-card-header>
            <ion-card-title>
              {{ userProfile.firstName }} {{ userProfile.lastName }}
            </ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <p><strong>Email :</strong> {{ userProfile.email }}</p>
            <p v-if="userProfile.bio"><strong>Bio :</strong> {{ userProfile.bio }}</p>
            <ion-button expand="full" @click="toggleSubscription">
              {{ isSubscribed ? "Se désabonner" : "S'abonner" }}
            </ion-button>
          </ion-card-content>
        </ion-card>
  
        <ion-card>
          <ion-card-header>
            <ion-card-title>Derniers articles</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-list v-if="latestPosts.length">
              <ion-card v-for="post in latestPosts" :key="post.id" button @click="openPostModal(post)">
                <ion-card-header>
                  <ion-card-subtitle>{{ formatDate(post.created_at) }}</ion-card-subtitle>
                </ion-card-header>
                <ion-card-content>
                  <p>{{ truncateContent(post.content) }}</p>
                </ion-card-content>
              </ion-card>
            </ion-list>
            <ion-spinner v-else></ion-spinner>
          </ion-card-content>
        </ion-card>
  
        <ion-modal v-model:isOpen="isPostModalOpen">
          <ion-header>
            <ion-toolbar>
              <ion-title>{{ selectedPost?.title }}</ion-title>
              <ion-buttons slot="end">
                <ion-button @click="closePostModal">Fermer</ion-button>
              </ion-buttons>
            </ion-toolbar>
          </ion-header>
          <ion-content class="ion-padding">
            <div v-if="selectedPost">
              <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <p>
                    <strong>
                      {{ selectedPost.firstName ? selectedPost.firstName : 'Utilisateur inconnu' }} 
                      {{ selectedPost.lastName ? selectedPost.lastName : '' }}
                    </strong>
                  </p>
                  <p class="date">{{ formatDate(selectedPost.created_at) }}</p>
                </div>
                <div class="likes" style="display: flex; align-items: center; cursor: pointer;" @click="toggleLike(selectedPost.id)">
                  <ion-icon :icon="selectedPost.likedByUser ? heart : heartOutline" style="margin-right: 4px;"></ion-icon>
                  <span>{{ selectedPost.likes }}</span>
                </div>
              </div>
              <div class="article-content" style="margin-top: 16px;">
                <p>{{ selectedPost.content }}</p>
              </div>
              <div class="comments-section" style="margin-top: 24px;">
                <h3>Commentaires</h3>
                <ion-list>
                  <ion-item v-for="comment in selectedPost.comments" :key="comment.id">
                    <ion-label>
                      <strong>{{ comment.firstName }} {{ comment.lastName }}</strong>
                      <p>{{ comment.comment_text }}</p>
                    </ion-label>
                  </ion-item>
                </ion-list>
                <ion-item>
                  <ion-input v-model="newCommentModal" placeholder="Écrire un commentaire..."></ion-input>
                  <ion-button @click="addCommentModal(selectedPost.id)">Envoyer</ion-button>
                </ion-item>
              </div>
            </div>
          </ion-content>
        </ion-modal>
      </ion-content>
    </ion-page>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  import {
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonList, IonItem, IonLabel, IonButton, IonSpinner,
    IonModal, IonInput, IonButtons, IonIcon
  } from '@ionic/vue';
  import axios from 'axios';
  import { heartOutline, heart } from 'ionicons/icons';
  
  interface Post {
    id: number;
    title: string;
    content: string;
    images: string | null;
    created_at: string;
    firstName?: string;
    lastName?: string;
    user_id: number;
    comments: any[];
    showComments: boolean;
    likes: number;
    likedByUser: boolean;
  }
  
  interface UserProfile {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    bio?: string;
    role: 'admin' | 'researcher' | 'user';
    created_at?: string;
  }
  
  const route = useRoute();
  const publisherId = Number(route.params.id);
  
  const userProfile = ref<UserProfile>({
    id: 0,
    firstName: '',
    lastName: '',
    email: '',
    bio: '',
    role: 'user'
  });
  const isSubscribed = ref<boolean>(false);
  const currentUser = ref<any>(null);
  const latestPosts = ref<Post[]>([]);
  
  const selectedPost = ref<Post | null>(null);
  const isPostModalOpen = ref<boolean>(false);
  const newCommentModal = ref<string>('');
  
  const formatDate = (date: string) => new Date(date).toLocaleDateString();
  const truncateContent = (content: string) => {
    const maxLength = 150;
    return content.length <= maxLength ? content : content.substring(0, maxLength) + '...';
  };
  
  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`http://localhost:8081/api/users/${publisherId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      userProfile.value = response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération du profil utilisateur:", error);
    }
  };
  
  const fetchSubscriptionStatus = async () => {
    if (!currentUser.value) return;
    try {
      const response = await axios.get(`http://localhost:8081/api/subscriptions/${currentUser.value.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      isSubscribed.value = response.data.some((sub: any) => sub.id === publisherId);
    } catch (error) {
      console.error("Erreur lors de la récupération des abonnements:", error);
    }
  };
  
  const toggleSubscription = async () => {
    if (!currentUser.value) return;
    try {
      if (isSubscribed.value) {
        await axios.delete('http://localhost:8081/api/subscriptions', {
          data: { followerId: currentUser.value.id, followedId: publisherId },
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        isSubscribed.value = false;
      } else {
        await axios.post('http://localhost:8081/api/subscriptions', {
          followerId: currentUser.value.id,
          followedId: publisherId
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        isSubscribed.value = true;
      }
    } catch (error) {
      console.error("Erreur lors de la modification de l'abonnement:", error);
    }
  };
  
  const fetchLatestPosts = async () => {
    try {
      const response = await axios.get('http://localhost:8081/api/posts', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const publisherPosts = response.data.filter((post: any) => post.user_id === publisherId);
      publisherPosts.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      latestPosts.value = publisherPosts.slice(0, 3).map((post: any) => ({
        ...post,
        comments: [],
        showComments: false,
        likes: 0,
        likedByUser: false
      }));
      for (let post of latestPosts.value) {
        await fetchLikesForPost(post.id);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des publications du publisher:", error);
    }
  };
  
  const fetchLikesForPost = async (postId: number) => {
    try {
      const response = await axios.get(`http://localhost:8081/api/likes/${postId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const post = latestPosts.value.find(p => p.id === postId);
      if (post) {
        post.likes = response.data.length;
        post.likedByUser = response.data.some((like: any) => like.user_id === currentUser.value.id);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des likes pour le post:", error);
    }
  };
  
  const toggleLike = async (postId: number) => {
    if (!currentUser.value) return;
    const post = latestPosts.value.find(p => p.id === postId);
    if (!post) return;
    try {
      if (post.likedByUser) {
        await axios.delete('http://localhost:8081/api/likes', {
          data: { postId, userId: currentUser.value.id },
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        post.likes = Math.max(post.likes - 1, 0);
        post.likedByUser = false;
      } else {
        await axios.post('http://localhost:8081/api/likes', { postId, userId: currentUser.value.id }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        post.likes += 1;
        post.likedByUser = true;
      }
    } catch (error) {
      console.error("Erreur lors du like pour le post:", error);
    }
  };
  
  const fetchComments = async (postId: number) => {
    try {
      const response = await axios.get(`http://localhost:8081/api/comments/${postId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const post = latestPosts.value.find(p => p.id === postId);
      if (post) {
        post.comments = response.data;
      }
    } catch (error) {
      console.error("Erreur lors du chargement des commentaires pour le post:", error);
    }
  };
  
  const toggleComments = async (postId: number) => {
    const post = latestPosts.value.find(p => p.id === postId);
    if (!post) return;
    post.showComments = !post.showComments;
    if (post.showComments && post.comments.length === 0) {
      await fetchComments(postId);
    }
  };
  
  const addCommentModal = async (postId: number) => {
    if (!currentUser.value) return;
    if (!newCommentModal.value.trim()) return;
    try {
      await axios.post('http://localhost:8081/api/comments', {
        postId,
        userId: currentUser.value.id,
        commentText: newCommentModal.value.trim()
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      newCommentModal.value = '';
      await fetchComments(postId);
    } catch (error) {
      console.error("Erreur lors de l'ajout du commentaire depuis le modal:", error);
    }
  };
  
  const openPostModal = async (post: Post) => {
    selectedPost.value = post;
    await fetchComments(post.id);
    isPostModalOpen.value = true;
  };
  
  const closePostModal = () => {
    isPostModalOpen.value = false;
    selectedPost.value = null;
  };
  
  onMounted(async () => {
    currentUser.value = JSON.parse(localStorage.getItem('user') || 'null');
    await fetchUserProfile();
    await fetchSubscriptionStatus();
    await fetchLatestPosts();
  });
  </script>
  
  <style scoped>
  .date {
    font-size: 0.9em;
    color: #666;
  }
  </style>
  