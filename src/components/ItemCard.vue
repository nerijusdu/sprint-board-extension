<template>
  <a v-if="!!item" class="card-container" :href="item.link" draggable="false">
    <div :class="['sub-container', itemType]">
      <div class="title">
        <span class="task-number">{{ item.id }}</span>
        {{ item.fields['System.Title'] }}
      </div>
      <div class="details">
        <div v-show="item.fields['Microsoft.VSTS.Scheduling.Effort']">
          Effort: <b>{{ item.fields['Microsoft.VSTS.Scheduling.Effort'] }}</b>
        </div>
        <div>{{ item.assignee }}</div>
        <div class="tags">
          <div v-for="tag in tags" :key="tag">{{ tag }}</div>
        </div>
      </div>
    </div>
  </a>
</template>

<script>
export default {
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  computed: {
    itemType() {
      switch (this.item.fields['System.WorkItemType']) {
        case 'Product Backlog Item': return 'pbi';
        case 'Bug': return 'bug';
        default: return '';
      }
    },
    tags() {
      return (this.item.fields['System.Tags'] || '')
        .split('; ')
        .filter(x => !!x);
    }
  }
};
</script>

<style scoped>
.card-container {
  border: 3px solid #e7e9eb;
  border-radius: 15px;
  margin: 10px;
  padding: 10px;
  background-color: white;
  display: flex;
  align-self: stretch;
  justify-self: flex-start;
  text-align: justify;
  text-decoration: none;
  color: black;
}

.sub-container {
  padding: 10px;
}

.sub-container.pbi {
  border-left: 5px solid #009ccc;
}

.sub-container.bug {
  border-left: 5px solid #cc293d;
}

.title {
  font-weight: bold;
  margin-bottom: 10px;
}

.task-number {
  font-weight: bolder;
}

.details {
  color: #797e88;
  font-size: smaller;
  font-weight: bold;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  margin-top: 10px;
}

.tags > div {
  margin-right: 5px;
  padding: 2px;
  padding-left: 5px;
  padding-right: 5px;
  border: 2px solid #e7e9eb;
  border-radius: 5px;
  margin-bottom: 5px;
}
</style>
