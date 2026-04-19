<template>
    <div class="login">
      <h2>Se connecter</h2>
      <form @submit.prevent="handleLogin">
        <input type="text" v-model="username" placeholder="Nom d'utilisateur" required />
        <button type="submit">Se connecter</button>
      </form>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { useAppData } from '../composables/useAppData';
  
  const username = ref('');
  const router = useRouter();
  const { setCurrentUserByPseudo } = useAppData();
  
  async function handleLogin() {
    try {
      const user = await setCurrentUserByPseudo(username.value);
      if (!user) {
        alert("Utilisateur introuvable (vérifie le pseudo).");
        return;
      }
      router.push('/account');
    } catch (e) {
      alert((e as Error).message || "Erreur de connexion");
    }
  }
  </script>
  
  <style scoped>
  .login {
    max-width: 400px;
    margin: 50px auto;
    text-align: center;
    padding: 20px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }
  
  .login input {
    width: 100%;
    padding: 10px;
    margin-bottom: 20px;
    border: 1px solid #ddd;
    border-radius: 5px;
  }
  
  .login button {
    width: 100%;
    padding: 10px;
    background-color: #28a745;
    color: white;
    border: none;
    border-radius: 5px;
  }
  </style>
  