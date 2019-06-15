<template>
  <div id="app">
    <navigation />
    <router-view />
    <loader />
  </div>
</template>

<script>
import Board from './components/Board.vue';
import Loader from './components/Loader.vue';
import Navigation from './components/Navigation.vue';

export default {
  name: 'app',
  components: {
    Board,
    Loader,
    Navigation
  }
};
</script>

<style>
body, html {
  margin: 0px;
  padding: 0px;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  background-color: #f9fbfc;
  display: flex;
  flex-direction: column;
}
</style>
