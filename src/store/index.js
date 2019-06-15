import Vue from 'vue';
import Vuex from 'vuex';
import actions from './actions';
import mutations from './mutations';
import getters from './getters';

Vue.use(Vuex);

const state = {
  activeLoaders: 0,
  refreshTime: 15 * 60 * 1000,
  boardItems: {
    todo: [],
    dev: [],
    codeReview: [],
    testing: []
  }
};

const store = new Vuex.Store({
  state,
  actions,
  mutations,
  getters
});

export default store;
