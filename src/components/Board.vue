<template>
  <div class="board-container">
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
import { mapActions } from 'vuex';
import { setTimeout } from 'timers';

const refreshTime = 15 * 60 * 1000;

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
  methods: {
    ...mapActions(['addLoader', 'removeLoader']),
    async reloadData() {
      this.addLoader();
      const items = await boardService.getBoardItems();

      this.todoItems = items.todo;
      this.devItems = items.dev;
      this.codeReviewItems = items.codeReview;
      this.testingItems = items.testing;

      this.removeLoader();
    }
  },
  mounted() {
    this.reloadData();

    setTimeout(this.reloadData, refreshTime);
  }
};
</script>

<style scoped>
.board-container {
  display: flex;
  width: 100%;
}

.column {
  margin-top: 10px;
  display: flex;
  width: 100%;
  justify-content: flex-start;
  align-items: center;
  flex-direction: column;
}

.column-title {
  font-weight: bold;
}
</style>
