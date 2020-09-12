import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import VueRouter from 'vue-router'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import auth from './plugins/auth'
import database from './plugins/database'

Vue.config.productionTip = false

Vue.use(VueRouter)
Vue.use(Vuex)
Vue.use(auth, {
  client_id: '***REMOVED***'
})
Vue.use(database, Vue.prototype.$auth)
Vue.prototype.$axios = axios

//global storage for profile data and whether or not the user is signed in
const store = new Vuex.Store({
  state: {
    isSignedIn: false,
    googleProfile: null,
    username: null
  },
  mutations: {
    async signIn(state, newState){
      Object.assign(state, newState)
    },
    async signOut(state){
      state.isSignedIn = false
      state.googleProfile = null
      state.username = null
    }
  },
  actions: {
    async signIn({commit}){
      var newState = {}
      await Vue.prototype.$auth.then(async auth => {
        if(!auth.isSignedIn.get()) await auth.signIn()
        Vue.prototype.$database.updateUser()
        await Vue.prototype.$database.getUser().then(res=>{
          newState.username = res.username
          console.log("set username in signIn() main")
        }).catch(e=>console.error(e))
        newState.googleProfile = auth.currentUser.get().getBasicProfile()
        newState.isSignedIn=true
      })
      commit('signIn', newState)
    },
    async signOut({commit}){
      commit('signOut')
      await Vue.prototype.$auth.then(async auth =>{
        await auth.signOut()
      })
    }
  }
})

//Initialize isSignedIn property 
Vue.prototype.$auth.then(async auth => {
  if(auth.isSignedIn.get())
   await store.dispatch('signIn')
})
//define function to run when path requires authentication
const ifAuthenticated = async (to, from, next) => {
  Vue.prototype.$auth.then(auth=>{
    console.log(auth.isSignedIn.get())
    if (auth.isSignedIn.get()) {
      next()
      return
    }
    next({ path: '/login?redirect=' + to.path })
  })
}
//automatically maps all components in pages folder to routes
var routes = []
const req = require.context('./views/', false, /\.(js|vue)$/i)
req.keys().map(key => {
  const name = key.match(/\w+/)[0]
  var component = Vue.component(name, req(key).default)
  routes.push(
    ({ //switch expression 
      Home: {path: '/', component: component},
      Login: {path: '/'+name, component: component},
    })[name]
    || {path: '/'+name, component: component, beforeEnter: ifAuthenticated} //default case
  )
  return component
})
//constructs vue router element
const router = new VueRouter({
  mode: 'history',
  routes: routes
})
//initializes the vue instance
new Vue({
  vuetify,
  router,
  store,
  render: h => h(App)
}).$mount('#app')