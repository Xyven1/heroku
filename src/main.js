import Vue from 'vue'
import Vuex from 'vuex'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import axios from 'axios'
import VueRouter from 'vue-router'
import GoogleAuth from './auth/auth.js'

Vue.config.productionTip = false

Vue.use(VueRouter)
Vue.use(Vuex)
Vue.use(GoogleAuth, {
  client_id: '***REMOVED***'
})

Vue.prototype.$axios = axios 
Vue.prototype.$auth = Vue.GoogleAuth // $auth becomes a promise which returns the google oauth2 object

//global storage for profile data and whether or not the user is signed in
const store = new Vuex.Store({
  state: {
    isSignedIn: false,
    googleProfile: null,
    username: null
  },
  mutations: {
    async signIn(state){
      await Vue.prototype.$auth.then(async auth => {
        await axios.get('/database/user', {params: {idtoken: auth.currentUser.get().getAuthResponse().id_token}}).then(res=>{
          state.username = res.data.username
          vuetify.theme.dark = res.data.darkmode
        })
        state.googleProfile = auth.currentUser.get().getBasicProfile()
      })
      state.isSignedIn=true
      console.log(state)
    },
    async signOut(state){
      state.isSignedIn=false
      state.googleProfile=null
      state.username=null
    }
  }
})

//Initialize isSignedIn property 
Vue.prototype.$auth.then(async auth => {
  if(auth.isSignedIn.get())
   await store.commit('signIn')
})
//define function to run when path requires authentication
const ifAuthenticated = async (to, from, next) => {
  Vue.prototype.$auth.then(auth=>{
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