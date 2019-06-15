<template>
  <div id="app">
    <!-- <a :href="authUrl">Auth</a> -->
    <board />
  </div>
</template>

<script>
import azureService from './services/azureService';
import Board from './components/Board.vue';

export default {
  name: 'app',
  components: {
    Board
  },
  data: () => ({
    authUrl: azureService.authUrl,
    items: []
  })
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
}
</style>
