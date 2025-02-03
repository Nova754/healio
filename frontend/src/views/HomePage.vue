<template>
  <ion-page>
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
              {{ post.user?.firstName || 'Utilisateur inconnu' }} {{ post.user?.lastName || '' }}
            </ion-card-title>
            <ion-card-subtitle>{{ formatDate(post.created_at) }}</ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>
            <p>{{ post.content }}</p>
            <ion-img v-if="post.media" :src="post.media"></ion-img>
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
                <ion-button fill="clear" @click="editComment(post.id, comment.id, comment.comment_text)">✏️</ion-button>
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
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonCard, 
  IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonItem, 
  IonLabel, IonInput, IonButton, IonIcon, IonSpinner, IonRow, IonButtons 
} from '@ionic/vue';
import { chatbubbleOutline, heartOutline, heart } from 'ionicons/icons';
import axios from 'axios';

const posts = ref([]);
const newComment = ref({});
const user = ref(null);

onMounted(async () => {
  user.value = JSON.parse(localStorage.getItem('user'));
  await fetchPosts();
});

const fetchPosts = async () => {
  try {
    const response = await axios.get('http://localhost:8081/api/posts', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });

    posts.value = response.data.map(post => ({
      ...post,
      comments: [],
      showComments: false,
      likes: post.likes || 0,
      likedByUser: false
    }));

    if (user.value) {
      for (let post of posts.value) {
        await checkIfUserLikedPost(post.id);
      }
    }
  } catch (error) {
    console.error('Erreur lors du chargement des posts:', error);
  }
};

const checkIfUserLikedPost = async (postId) => {
  try {
    const response = await axios.get(`http://localhost:8081/api/likes/${postId}/${user.value.id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });

    const post = posts.value.find(p => p.id === postId);
    if (post) {
      post.likedByUser = response.data.liked;
    }
  } catch (error) {
    console.error("Erreur lors de la vérification du like :", error);
  }
};

// ✅ Gérer les likes
const toggleLike = async (postId) => {
  if (!user.value) return;

  const post = posts.value.find(p => p.id === postId);
  if (!post) return;

  try {
    if (post.likedByUser) {
      await axios.delete('http://localhost:8081/api/likes', {
        data: { postId, userId: user.value.id },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      post.likes -= 1;
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
    console.error("Erreur lors du chargement des commentaires :", error);
  }
};

const toggleComments = async (postId) => {
  const post = posts.value.find(p => p.id === postId);
  if (!post) return;

  post.showComments = !post.showComments;

  if (post.showComments && post.comments.length === 0) {
    await fetchComments(postId);
  }
};

const addComment = async (postId) => {
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

const deleteComment = async (postId, commentId) => {
  await axios.delete(`http://localhost:8081/api/comments/${commentId}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
  await fetchComments(postId);
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};
</script>