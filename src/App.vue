<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
  </div>
</template>

<script>
import azureService from './services/azureService';

export default {
  name: 'app',
  async mounted() {
    const team = 'Run Team';
    // const res = await azureService.getCurrentIteration(team);
    // const items = await azureService.getIterationWorkItems(team, res.id);
    console.log(items);
  },
};
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
