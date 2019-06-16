import Vue from 'vue';
import VueRouter from 'vue-router';
import Board from '../components/Board.vue';
import Settings from '../components/Settings.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    redirect: '/board'
  },
  {
    path: '/board',
    component: Board,
    name: 'board'
  },
  {
    path: '/settings',
    component: Settings,
    name: 'settings'
  }
];

const router = new VueRouter({
  routes,
  mode: 'history'
});

export default router;
