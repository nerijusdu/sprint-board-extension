<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
    <a :href="authUrl">Auth</a>
  </div>
</template>

<script>
import azureService from './services/azureService';
import boardService from './services/boardService';

export default {
  name: 'app',
  data: () => ({
    authUrl: azureService.authUrl
  }),
  async mounted() {
    const team = 'Run Team';
    const res = await azureService.getCurrentIteration(team);
    const itemReferences = await azureService.getIterationWorkItems(team, res.id);
    const items = await azureService.getWorkItemDetails(itemReferences);
    const groupedItems = boardService.groupWorkItems(items);
    console.log(groupedItems);
  }
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
