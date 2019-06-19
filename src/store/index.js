import Vue from 'vue';
import Vuex from 'vuex';
import actions from './actions';
import mutations from './mutations';
import getters from './getters';

Vue.use(Vuex);

const state = {
  isAccessGranted: window.localStorage.getItem('appAuthorized') === 'true',
  activeLoaders: 0,
  boardItems: {
    todo: [],
    dev: [],
    codeReview: [],
    testing: [],
    done: []
  },
  settings: {
    organization: '',
    project: '',
    team: '',
    refreshTime: 15,
    devTitles: 'Development',
    codeReviewTitles: 'Code review',
    testingTitles: 'Testing',
    doneTitles: 'Done'
  },
  message: {
    content: '',
    isError: false
  }
};

const store = new Vuex.Store({
  state,
  actions,
  mutations,
  getters
});

export default store;
