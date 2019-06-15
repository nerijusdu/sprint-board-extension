<template>
  <div class="container">
    <div class="column">
      <div class="column-title">To Do ({{ todoItems.length }})</div>
      <item-card v-for="item in todoItems" :key="item.id" :item="item"/>
    </div>
    <div class="column">
      <div class="column-title">Development ({{ devItems.length }})</div>
      <item-card v-for="item in devItems" :key="item.id" :item="item"/>
    </div>
    <div class="column">
      <div class="column-title">Code Review ({{ codeReviewItems.length }})</div>
      <item-card v-for="item in codeReviewItems" :key="item.id" :item="item"/>
    </div>
    <div class="column">
      <div class="column-title">Testing ({{ testingItems.length }})</div>
      <item-card v-for="item in testingItems" :key="item.id" :item="item"/>
    </div>
  </div>
</template>

<script>
import boardService from '../services/boardService';
import ItemCard from './ItemCard.vue';

export default {
  components: {
    ItemCard
  },
  data: () => ({
    todoItems: [],
    devItems: [],
    codeReviewItems: [],
    testingItems: []
  }),
  async mounted() {
    const items = await boardService.getBoardItems();

    this.todoItems = items.todo;
    this.devItems = items.dev;
    this.codeReviewItems = items.codeReview;
    this.testingItems = items.testing;
  }
};
</script>

<style scoped>
.container {
  display: flex;
}

.column-title {
  font-weight: bold;
}
</style>
