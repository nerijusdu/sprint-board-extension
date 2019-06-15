import boardService from '../services/boardService';

export default {
  addLoader({ commit }) {
    commit('updateLoading', 1);
  },
  removeLoader({ commit }) {
    commit('updateLoading', -1);
  },
  async reloadBoardData({ commit, dispatch, state }) {
    dispatch('addLoader');
    const result = await boardService.getBoardItems();
    dispatch('removeLoader');

    setTimeout(() => dispatch('reloadBoardData'), state.refreshTime);

    commit('updateBoardItems', result);
  },
  init({ dispatch }) {
    dispatch('reloadBoardData');
  }
};
