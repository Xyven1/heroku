import Vue from 'vue'
import Vuex from 'vuex'
import vuetify from './vuetify'
import auth from './auth'

Vue.use(Vuex)

function initialState(){
  return {
    isSignedIn: false,
    googleProfile: null,
    username: null, 
    userid: null,
    money: null,
  }
}

const mutations = {
  signIn(state, newState){
    Object.keys(newState).forEach(key => {
      state[key] = newState[key]
    })
  },
  signOut(state){
    Object.keys(initialState()).forEach(key => {
      state[key] = initialState()[key]
    })
  },
  SOCKET_UPDATEDPRIVATE(state, data){
    Object.keys(data).forEach(key => {
      state[key] = data[key]
    })
    localStorage.darkMode = data.darkmode
    vuetify.framework.theme.dark = data.darkmode
  }
}

 const actions = {
   async signIn({commit}){
    var newState = {}
    await auth.then(async auth => {
      if(!auth.isSignedIn.get()) await auth.signIn().catch(()=>{}) //if not signed in try to sign in
      if(!auth.isSignedIn.get()) return //if user STILL not signed in after sign in attempt, break function
      await new Promise((resolve, reject) =>{
        Vue.prototype.$socket.client.emit('login', auth.currentUser.get().getAuthResponse().id_token, res=>{
          if (res.ok){
            newState.username = res.data.username
            newState.userid = res.data.userid
            newState.money = res.data.money
            localStorage.darkMode = res.data.darkmode
            vuetify.framework.theme.dark = res.data.darkmode
            resolve()
          }
          else reject()
        })
      }).catch(function () {
        return
      })
      newState.googleProfile = auth.currentUser.get().getBasicProfile()
      newState.isSignedIn=true
    })
    commit('signIn', newState)
  },
  async signOut({commit}){
    commit('signOut')
    Vue.prototype.$socket.client.emit('logout')
    await auth.then(async auth =>{
      await auth.signOut()
    })
  }
}

export default new Vuex.Store({
  state: initialState,
  mutations: mutations,
  actions: actions,
})