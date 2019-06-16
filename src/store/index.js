import Vue from 'vue';
import Vuex from 'vuex';
import actions from './actions';
import mutations from './mutations';
import getters from './getters';

Vue.use(Vuex);

const state = {
  activeLoaders: 0,
  boardItems: {
    todo: [],
    dev: [],
    codeReview: [],
    testing: []
  },
  settings: {
    organization: '',
    project: '',
    team: '',
    refreshTime: 15,
    devTitles: 'Development',
    codeReviewTitles: 'Code review'
  }
};

const store = new Vuex.Store({
  state,
  actions,
  mutations,
  getters
});

export default store;
