<template>
    <div class="vinyles">
      <h2>Mes vinyles</h2>
      <div class="vinyl-list">
        <div v-for="vinyl in vinyles" :key="vinyl.id" class="vinyl-card">
          <img :src="vinyl.image" alt="vinyl cover" />
          <h3>{{ vinyl.title }}</h3>
          <p>{{ vinyl.artist }}</p>
          <button @click="proposerEchange(vinyl)">Proposer un échange</button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  const vinyles = [
    { id: 1, title: "Dark Side of the Moon", artist: "Pink Floyd", image: "/assets/darkside.jpg" },
    { id: 2, title: "Abbey Road", artist: "The Beatles", image: "/assets/abbeyroad.jpg" },
    { id: 3, title: "The Wall", artist: "Pink Floyd", image: "/assets/thewall.jpg" }
  ];
  
  function proposerEchange(vinyl) {
    alert(`Proposer un échange pour : ${vinyl.title}`);
  }
  </script>
  
  <style scoped>
  .vinyles {
    text-align: center;
  }
  
  .vinyl-list {
    display: flex;
    justify-content: space-around;
    flex-wrap: wrap;
  }
  
  .vinyl-card {
    width: 200px;
    margin: 20px;
    text-align: center;
  }
  
  img {
    width: 100%;
    border-radius: 10px;
  }
  </style>
  