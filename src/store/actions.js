import BoardService from '../services/boardService';
import store from './index';

let boardService = null;

export default {
  async init({ dispatch }) {
    boardService = new BoardService(store);
    await dispatch('loadSettingsFromMemory');
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

    if (context.state.settings.refreshTime >= 1) {
      setTimeout(() => context.dispatch('reloadBoardData'), context.state.settings.refreshTime * 60 * 1000);
    }
    context.dispatch('removeLoader');
  },
  saveSettings({ commit, dispatch }, settings) {
    window.localStorage.setItem('settings', JSON.stringify(settings));
    commit('updateSettings', settings);
    dispatch('showMessage', 'Settings saved successfuly.');
  },
  loadSettingsFromMemory({ commit }) {
    const settingsStr = window.localStorage.getItem('settings');
    if (settingsStr) {
      commit('updateSettings', JSON.parse(settingsStr));
    }
  },
  authorizeApp({ commit }) {
    window.localStorage.setItem('appAuthorized', 'true');
    commit('authorizeApp');
  },
  showError({ commit }, content) {
    commit('updateMessage', {
      content,
      isError: true
    });
  },
  showMessage({ commit }, content) {
    commit('updateMessage', {
      content,
      isError: false
    });
  }
};
