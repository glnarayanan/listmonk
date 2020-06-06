import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';

Vue.use(VueRouter);

// The meta.group param is used in App.vue to expand menu group by name.
const routes = [
  {
    path: '/',
    name: 'dashboard',
    meta: { title: 'Dashboard' },
    component: Home,
  },
  {
    path: '/lists',
    name: 'lists',
    meta: { title: 'Lists', group: 'lists' },
    component: () => import(/* webpackChunkName: "lists" */ '../views/Lists.vue'),
  },
  {
    path: '/lists/forms',
    name: 'forms',
    meta: { title: 'Forms', group: 'lists' },
    component: () => import(/* webpackChunkName: "forms" */ '../views/Forms.vue'),
  },
  {
    path: '/subscribers',
    name: 'subscribers',
    meta: { title: 'Subscribers', group: 'subscribers' },
    component: () => import(/* webpackChunkName: "subscribers" */ '../views/Subscribers.vue'),
  },
  {
    path: '/subscribers/import',
    name: 'import',
    meta: { title: 'Import subscribers', group: 'subscribers' },
    component: () => import(/* webpackChunkName: "import" */ '../views/Import.vue'),
  },
  {
    path: '/subscribers/:id',
    name: 'subscriber',
    meta: { title: 'Subscribers', group: 'subscribers' },
    component: () => import(/* webpackChunkName: "subscribers" */ '../views/Subscribers.vue'),
  },
  {
    path: '/campaigns',
    name: 'campaigns',
    meta: { title: 'Campaigns', group: 'campaigns' },
    component: () => import(/* webpackChunkName: "campaigns" */ '../views/Campaigns.vue'),
  },
  {
    path: '/campaign/:id',
    name: 'campaign',
    meta: { title: 'Campaign', group: 'campaigns' },
    component: () => import(/* webpackChunkName: "campaigns" */ '../views/Campaigns.vue'),
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

router.afterEach((to) => {
  Vue.nextTick(() => {
    document.title = to.meta.title;
  });
});

export default router;
