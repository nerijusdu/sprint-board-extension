<template>
  <div
    :class="['message-container', { error: isError }]"
    v-show="hasMessage"
    @click="hide"
  >
    {{ content }}
  </div>
</template>

<script>
import { mapGetters, mapState, mapActions } from 'vuex';

const hideAfter = 5000;

export default {
  computed: {
    ...mapGetters(['hasMessage']),
    ...mapState({
      content: state => state.message.content,
      isError: state => state.message.isError
    })
  },
  methods: {
    ...mapActions(['showMessage']),
    hide() {
      this.showMessage('');
    }
  },
  watch: {
    content(value) {
      if (value) {
        setTimeout(this.hide, hideAfter);
      }
    }
  }
};
</script>

<style scoped>
.message-container {
  background-color: #37ad55;
  position: fixed;
  bottom: 30px;
  align-self: center;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
}

.message-container.error {
  background-color: #cc293d;
}
</style>
