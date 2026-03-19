<template>
    <div class="login">
      <h2>Connexion</h2>
      <form @submit.prevent="login">
        <input v-model="username" type="text" placeholder="Nom d'utilisateur" required />
        <button type="submit">Se connecter</button>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const username = ref('');
  
  function login() {
    console.log(`Utilisateur connecté : ${username.value}`);
    const userId = username.value;
    alert(`Bienvenu ${userId}`);
  }
  </script>
  
  <style scoped>
  .login {
    text-align: center;
  }
  
  form {
    margin-top: 20px;
  }
  
  input {
    padding: 10px;
    margin-bottom: 10px;
  }
  
  button {
    padding: 10px 20px;
    background-color: #28a745;
    color: white;
    border: none;
  }
  </style>
  