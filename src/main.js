import Vue from 'vue'
import VueRouter from 'vue-router'
import store from './store'
import Vuex from 'vuex'

import Index from './Index.vue'
import Train from './Train.vue'
import Test from './Test.vue'
import HoldWords from './HoldWords.vue'
import Login from './Login.vue'
import Register from './Register.vue'
import MainApp from './MainApp.vue'

import iView from 'iview'
import 'iview/dist/styles/iview.css';

Vue.config.productionTip = false
Vue.use(iView);
Vue.use(VueRouter);
Vue.use(Vuex);

const routes = [
  { path: '/Index', name: 'index', component: Index },
  { path: '/Train', name: 'train',component: Train },
  { path: '/Test', name: 'test',component: Test },
  { path: '/Login', name: 'login',component: Login },
  { path: '/HoldWords', name: 'holdWords', component: HoldWords},
  { path: '/Register', name: 'register', component: Register },
  { path: "*", component: Login }
]

const router = new VueRouter({
  routes
})

new Vue({
  router,
  store : store,
  render: h => h(MainApp),
}).$mount('#app')
