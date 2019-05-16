import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);

const state = {
  localhostUrl : "http://192.168.3.19:3001",
  personData: {
    openId: "default",
    name: "default",
  },
}

const mutations = {
  setUserName(state, name){
    state.personData.name = name;
  },
  setUserId(state, id){
    state.personData.openId = id;
  }
}

const store = new Vuex.Store({
  state: state,
  mutations: mutations
})

export default store;