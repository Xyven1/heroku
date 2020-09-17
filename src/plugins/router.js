import Vue from 'vue'
import store from './store'
import VueRouter from 'vue-router'
import auth from './auth'

Vue.use(VueRouter)

const ifAuthenticated = async (to, from, next) => {
  auth.then(async auth=>{
    if (!auth.isSignedIn.get())
      await store.dispatch('signIn')
    if (auth.isSignedIn.get())
      return next()
    else
      return next('/')
  })
}
//automatically maps all components in pages folder to routes
var routes = []
const req = require.context('../views/', false, /\.(js|vue)$/i)
req.keys().forEach(key => {
  const name = key.match(/\w+/)[0]
  var component = Vue.component(name, req(key).default)
  routes.push(
    ({ //switch expression 
      Home: {path: '/', component: component},
      Leaderboard: {path: '/'+name, component: component},
    })[name]
    || {path: '/'+name, component: component, beforeEnter: ifAuthenticated} //default case
  )
})

//constructs vue router element
export default new VueRouter({
  mode: 'history',
  routes: routes
})
