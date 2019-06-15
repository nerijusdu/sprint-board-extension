import Vue from 'vue';
import VueRouter from 'vue-router';
import Board from '../components/Board.vue';

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
  }
];

const router = new VueRouter({
  routes,
  mode: 'history'
});

export default router;
