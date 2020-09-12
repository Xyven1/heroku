import axios from 'axios'
var localAuth;
var database = {
  getUser: function () {
    return new Promise((resolve, reject) => {
      console.log("Tried to get user")
      localAuth.then(auth=>{
        if(!auth.isSignedIn.get()) return reject("Not signed in")
        axios.get('/database/user', {
          params: {
            idtoken: auth.currentUser.get().getAuthResponse().id_token
          }
        }).then(res=>{
          resolve(res.data) 
        }).catch((e)=>{
          reject(e)
        })
      })
    })
  },
  updateUser: function (params) {
    return new Promise((resolve, reject) => {
      console.log("Tried to update " + Object.keys(params).join(', '))
      localAuth.then(auth=>{
        if(!auth.isSignedIn.get()) return reject("Not signed in")
        axios.post('/database/user', Object.assign({idtoken: auth.currentUser.get().getAuthResponse().id_token}, params)
        ).then(res=>{
          resolve(res)
        }).catch(e=>{
          reject(e)
        })
      })
    })
  },
}


export default {
  install: async function install(Vue, auth) {
    localAuth = auth
    Vue.prototype.$database = database
  }
}