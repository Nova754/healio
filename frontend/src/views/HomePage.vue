<template>
  <ion-page>
    <Navbar />
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Publications</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-list v-if="posts.length">
        <ion-card v-for="post in posts" :key="post.id">
          <ion-card-header>
            <ion-card-title>
              <router-link
                :to="{ name: 'PublisherProfile', params: { id: post.user_id } }"
                class="publisher-link"
              >
                {{ post.firstName ? post.firstName : 'Utilisateur inconnu' }}
                {{ post.lastName ? post.lastName : '' }}
              </router-link>
            </ion-card-title>
            <ion-card-subtitle>{{ formatDate(post.created_at) }}</ion-card-subtitle>
          </ion-card-header>

          <ion-card-content @click="openPostModal(post)" style="cursor: pointer;">
            <p>{{ truncateContent(post.content) }}</p>
          </ion-card-content>
          <ion-row class="ion-justify-content-between">
            <ion-button fill="clear" @click="toggleLike(post.id)">
              <ion-icon :icon="post.likedByUser ? heart : heartOutline" slot="start"></ion-icon>
              {{ post.likes }} Likes
            </ion-button>
            <ion-button fill="clear" @click="toggleComments(post.id)">
              <ion-icon :icon="chatbubbleOutline" slot="start"></ion-icon>
              Commentaires ({{ post.comments.length }})
            </ion-button>
          </ion-row>
          <ion-list v-if="post.showComments">
            <ion-item v-for="comment in post.comments" :key="comment.id">
              <ion-label>
                <strong>{{ comment.firstName }} {{ comment.lastName }}</strong>
                <p>{{ comment.comment_text }}</p>
              </ion-label>
              <ion-buttons v-if="user && comment.user_id === user.id">
                <ion-button fill="clear" color="danger" @click="deleteComment(post.id, comment.id)">🗑️</ion-button>
              </ion-buttons>
            </ion-item>
            <ion-item>
              <ion-input v-model="newComment[post.id]" placeholder="Écrire un commentaire..."></ion-input>
              <ion-button @click="addComment(post.id)">Envoyer</ion-button>
            </ion-item>
          </ion-list>
        </ion-card>
      </ion-list>
      <ion-spinner v-else></ion-spinner>

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
                <router-link
                  :to="{ name: 'PublisherProfile', params: { id: selectedPost.user_id } }"
                  class="publisher-link"
                >
                  <strong>
                    {{ selectedPost.firstName ? selectedPost.firstName : 'Utilisateur inconnu' }}
                    {{ selectedPost.lastName ? selectedPost.lastName : '' }}
                  </strong>
                </router-link>
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
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonItem, IonLabel, IonInput, IonButton, IonIcon, IonSpinner, IonRow, IonButtons, IonModal } from '@ionic/vue';
import { chatbubbleOutline, heartOutline, heart } from 'ionicons/icons';
import axios from 'axios';
import Navbar from '@/components/Navbar.vue';

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

const posts = ref<Post[]>([]);
const newComment = ref<Record<number, string>>({});
const user = ref<any>(null);
const mySubscriptions = ref<number[]>([]);

const selectedPost = ref<Post | null>(null);
const isPostModalOpen = ref<boolean>(false);
const newCommentModal = ref<string>('');

const fetchSubscriptions = async () => {
  if (!user.value) return;
  try {
    const response = await axios.get(`http://localhost:8081/api/subscriptions/${user.value.id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    mySubscriptions.value = response.data.map((u: any) => u.id);
  } catch (error) {
    console.error("Erreur lors du chargement des abonnements:", error);
  }
};

const fetchPosts = async () => {
  try {
    const response = await axios.get('http://localhost:8081/api/posts', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    posts.value = response.data.map((post: any) => ({
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
    console.error('Erreur lors du chargement des posts:', error);
  }
};

const fetchLikesForPost = async (postId: number) => {
  try {
    const response = await axios.get(`http://localhost:8081/api/likes/${postId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    const post = posts.value.find(p => p.id === postId);
    if (post) {
      post.likes = response.data.length;
      post.likedByUser = response.data.some((like: any) => like.user_id === user.value.id);
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des likes :", error);
  }
};

const toggleLike = async (postId: number) => {
  if (!user.value) return;
  const post = posts.value.find(p => p.id === postId);
  if (!post) return;
  try {
    if (post.likedByUser) {
      await axios.delete('http://localhost:8081/api/likes', {
        data: { postId, userId: user.value.id },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      post.likes = Math.max(post.likes - 1, 0);
      post.likedByUser = false;
    } else {
      await axios.post('http://localhost:8081/api/likes', { postId, userId: user.value.id }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      post.likes += 1;
      post.likedByUser = true;
    }
  } catch (error) {
    console.error("Erreur lors du like :", error);
  }
};

const fetchComments = async (postId: number) => {
  try {
    const response = await axios.get(`http://localhost:8081/api/comments/${postId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    const post = posts.value.find(p => p.id === postId);
    if (post) {
      post.comments = response.data;
    }
  } catch (error) {
    console.error("Erreur lors du chargement des commentaires :", error);
  }
};

const toggleComments = async (postId: number) => {
  const post = posts.value.find(p => p.id === postId);
  if (!post) return;
  post.showComments = !post.showComments;
  if (post.showComments && post.comments.length === 0) {
    await fetchComments(postId);
  }
};

const addComment = async (postId: number) => {
  if (!user.value) return;
  if (!newComment.value[postId] || newComment.value[postId].trim() === '') return;
  try {
    await axios.post('http://localhost:8081/api/comments', {
      postId,
      userId: user.value.id,
      commentText: newComment.value[postId].trim()
    }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    newComment.value[postId] = '';
    await fetchComments(postId);
  } catch (error) {
    console.error("Erreur lors de l'ajout du commentaire :", error);
  }
};

const addCommentModal = async (postId: number) => {
  if (!user.value) return;
  if (!newCommentModal.value.trim()) return;
  try {
    await axios.post('http://localhost:8081/api/comments', {
      postId,
      userId: user.value.id,
      commentText: newCommentModal.value.trim()
    }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    newCommentModal.value = '';
    await fetchComments(postId);
  } catch (error) {
    console.error("Erreur lors de l'ajout du commentaire depuis le modal :", error);
  }
};

const deleteComment = async (postId: number, commentId: number) => {
  try {
    await axios.delete(`http://localhost:8081/api/comments/${commentId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    await fetchComments(postId);
  } catch (error) {
    console.error("Erreur lors de la suppression du commentaire :", error);
  }
};

const truncateContent = (content: string) => {
  const maxLength = 150;
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength) + '...';
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString();
};

const isSubscribed = (publisherId: number) => {
  return mySubscriptions.value.includes(publisherId);
};

const toggleSubscription = async (publisherId: number) => {
  if (!user.value) return;
  try {
    if (mySubscriptions.value.includes(publisherId)) {
      await axios.delete('http://localhost:8081/api/subscriptions', {
        data: { followerId: user.value.id, followedId: publisherId },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      mySubscriptions.value = mySubscriptions.value.filter(id => id !== publisherId);
    } else {
      await axios.post('http://localhost:8081/api/subscriptions', {
        followerId: user.value.id,
        followedId: publisherId
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      mySubscriptions.value.push(publisherId);
    }
  } catch (error) {
    console.error("Erreur lors de la modification de l'abonnement :", error);
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
  user.value = JSON.parse(localStorage.getItem('user') || 'null');
  await fetchPosts();
  await fetchSubscriptions();
});
</script>

<style scoped>
.date {
  font-size: 0.9em;
  color: #666;
}
.publisher-link {
  text-decoration: none;
  color: inherit;
}
</style>
