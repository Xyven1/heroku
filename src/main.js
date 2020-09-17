import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import auth from './plugins/auth'
import store from './plugins/store'
import router from './plugins/router'
import VueSocketIOExt from 'vue-socket.io-extended'
import io from 'socket.io-client'
import vueDebounce from 'vue-debounce'
import VueNumber from 'vue-number-animation'

Vue.config.productionTip = false

const socket = io(process.env.NODE_ENV == "development" ? 'http://localhost:3000' : 'https://website-10.herokuapp.com');

Vue.use(VueSocketIOExt, socket, { store })
Vue.use(VueNumber)
Vue.use(vueDebounce, {
  defaultTime: '150ms',
  listenTo: 'input'
})

Vue.prototype.$socket.client.on('connect', () => {if(store.state.isSignedIn) store.dispatch('signIn')})
//Initialize isSignedIn property 
auth.then(async auth => {
  if(auth.isSignedIn.get())
   await store.dispatch('signIn')
})

//initializes the vue instance
new Vue({
  vuetify,
  router,
  store,
  render: h => h(App)
}).$mount('#app')