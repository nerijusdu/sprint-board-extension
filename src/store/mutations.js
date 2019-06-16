/* eslint-disable no-param-reassign */
export default {
  updateLoading(state, update) {
    const newValue = state.activeLoaders + update;
    state.activeLoaders = newValue < 0 ? 0 : newValue;
  },
  updateBoardItems(state, data) {
    state.boardItems = data;
  },
  updateSettings(state, data) {
    state.settings = data;
  }
};
