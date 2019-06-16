<template>
  <div class="board-container">
    <div class="board-sub-container" v-if="hasAzureSettings">
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
    <div v-if="!hasAzureSettings">
      <h2>Please add Azure DevOps configuration in the settings tab.</h2>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex';
import ItemCard from './ItemCard.vue';

export default {
  components: {
    ItemCard
  },
  computed: {
    ...mapState({
      todoItems: state => state.boardItems.todo,
      devItems: state => state.boardItems.dev,
      codeReviewItems: state => state.boardItems.codeReview,
      testingItems: state => state.boardItems.testing,
    }),
    ...mapGetters(['hasAzureSettings'])
  },
  methods: {
    ...mapActions(['addLoader', 'removeLoader', 'reloadBoardData'])
  }
};
</script>

<style scoped>
.board-container,
.board-sub-container {
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
