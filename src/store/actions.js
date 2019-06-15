export default {
  addLoader({ commit }) {
    commit('updateLoading', 1);
  },
  removeLoader({ commit }) {
    commit('updateLoading', -1);
  }
};
