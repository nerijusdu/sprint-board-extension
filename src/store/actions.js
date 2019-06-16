import BoardService from '../services/boardService';
// eslint-disable-next-line import/no-cycle
import store from './index';

let boardService = null;

export default {
  init({ dispatch }) {
    boardService = new BoardService(store);
    dispatch('loadSettingsFromMemory');
  },
  addLoader({ commit }) {
    commit('updateLoading', 1);
  },
  removeLoader({ commit }) {
    commit('updateLoading', -1);
  },
  async reloadBoardData(context) {
    if (!context.getters.hasAzureSettings || !context.state.isAccessGranted) {
      return;
    }

    context.dispatch('addLoader');

    const result = await boardService.getBoardItems();
    context.commit('updateBoardItems', result);

    setTimeout(() => context.dispatch('reloadBoardData'), context.state.settings.refreshTime * 60 * 1000);
    context.dispatch('removeLoader');
  },
  saveSettings({ commit }, settings) {
    window.localStorage.setItem('settings', JSON.stringify(settings));
    commit('updateSettings', settings);
  },
  loadSettingsFromMemory({ commit }) {
    const settingsStr = window.localStorage.getItem('settings');
    if (settingsStr) {
      commit('updateSettings', JSON.parse(settingsStr));
    }
  },
  authorizeApp({ commit }) {
    commit('authorizeApp');
  }
};
