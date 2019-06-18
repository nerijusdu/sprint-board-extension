<template>
  <div
    :class="['refresh-button', { disabled: isLoading || !hasAzureSettings || !IsAccessGranted }]"
    @click="refresh"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="feather feather-refresh-cw"
    >
      <polyline points="23 4 23 10 17 10"></polyline>
      <polyline points="1 20 1 14 7 14"></polyline>
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
    </svg>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex';

export default {
  computed: {
    ...mapGetters(['isLoading', 'hasAzureSettings']),
    ...mapState(['IsAccessGranted'])
  },
  methods: {
    ...mapActions(['reloadBoardData']),
    refresh() {
      if (!this.isLoading && this.IsAccessGranted && this.hasAzureSettings) {
        this.reloadBoardData();
      }
    }
  }
};
</script>

<style scoped>
.refresh-button {
  background-color: #009ccc;
  position: fixed;
  bottom: 30px;
  right: 30px;
  padding: 15px;
  border-radius: 30px;
  cursor: pointer;
}

.refresh-button.disabled {
  cursor: default;
  background-color: #e7e9eb;
}

.feather-refresh-cw {
  color: white;
}
</style>
