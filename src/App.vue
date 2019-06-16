<template>
  <div id="app">
    <navigation />
    <router-view />
    <loader />
    <message />
    <refresh />
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import Loader from './components/Loader.vue';
import Navigation from './components/Navigation.vue';
import Message from './components/Message.vue';
import Refresh from './components/Refresh.vue';

export default {
  name: 'app',
  components: {
    Refresh,
    Message,
    Loader,
    Navigation
  },
  methods: mapActions(['init']),
  async mounted() {
    await this.init();
  }
};
</script>

<style>
body, html {
  margin: 0px;
  padding: 0px;
  background-color: #f9fbfc;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  display: flex;
  flex-direction: column;
}
</style>
