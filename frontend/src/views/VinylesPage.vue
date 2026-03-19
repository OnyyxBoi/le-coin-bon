<template>
    <div class="vinyles">
      <h2>Mes Vinyles</h2>
      <div class="vinyl-list">
        <div v-for="vinyl in vinyles" :key="vinyl.id" class="vinyl-card">
          <img :src="vinyl.image" alt="Vinyl Cover" />
          <h3>{{ vinyl.title }}</h3>
          <p>{{ vinyl.artist }}</p>
          <button @click="selectForExchange(vinyl)">Sélectionner pour échange</button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  const vinyles = [
    { id: 1, title: 'Dark Side of the Moon', artist: 'Pink Floyd', image: '/assets/darkside.jpg' },
    { id: 2, title: 'Abbey Road', artist: 'The Beatles', image: '/assets/abbeyroad.jpg' },
    { id: 3, title: 'The Wall', artist: 'Pink Floyd', image: '/assets/thewall.jpg' }
  ]
  
  function selectForExchange(vinyl) {
    alert(`Vous avez sélectionné ${vinyl.title} pour échange.`);
  }
  </script>
  
  <style scoped>
  .vinyles {
    text-align: center;
  }
  
  .vinyl-list {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .vinyl-card {
    margin: 15px;
    width: 200px;
    text-align: center;
  }
  
  .vinyl-card img {
    width: 100%;
    border-radius: 10px;
  }
  
  button {
    padding: 10px;
    background-color: #28a745;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  
  button:hover {
    background-color: #218838;
  }
  </style>
  