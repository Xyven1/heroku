<template>
  <v-app id="app">
    <v-app-bar app color="primary">
      <v-app-bar-nav-icon @click="drawer=true"></v-app-bar-nav-icon>
      <v-toolbar-title><number v-if="$store.state.isSignedIn" class="bold" ref="number2" :format="n=>'$'+n.toFixed(2)" :to="$store.state.money" :duration="2" easing="Power2.easeOut"/></v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn :to="$store.state.isSignedIn ? '/profile' : null" @click="()=>{if(!$store.state.isSignedIn) $store.dispatch('signIn')}" elevation="0" color="transparent">
        <v-list-item-content class="pr-2">
          {{$store.state.isSignedIn ? $store.state.username || $store.state.googleProfile.getName() : "Login"}}
        </v-list-item-content>
        <v-avatar :size="33">
          <v-img :src="$store.state.isSignedIn ? $store.state.googleProfile.getImageUrl() : 'loading'">
            <v-icon v-if="!$store.state.isSignedIn">mdi-account</v-icon>
          </v-img>
        </v-avatar>
      </v-btn>
      <v-tooltip bottom v-if="$socket.disconnected" >
        <template v-slot:activator="{ on, attrs }">
          <v-icon color="error" v-bind="attrs" v-on="on" class="ml-2"> 
            mdi-lan-disconnect
          </v-icon>
        </template>
        <span>Disconnected</span>
      </v-tooltip>
      <v-menu offset-y transition="slide-y-transition" :close-on-content-click="false">
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon v-bind="attrs" v-on="on">
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>
        <v-card>
          <div class="pa-2">
            <v-btn icon @click="darkMode"><v-icon>{{$vuetify.theme.dark ? 'mdi-white-balance-sunny' : 'mdi-weather-night'}}</v-icon></v-btn>
          </div>
        </v-card>
      </v-menu>
    </v-app-bar>
    <v-navigation-drawer app color="primary" v-model="drawer" temporary width="200">
      <v-list nav>
        <v-list-item v-for="(item, index) in navigationItems" :key="index" link :to="item.href">
          <v-list-item-icon class="mr-1">
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-main class="fill-height" fluid ref="main">
      <transition name="fade" mode="out-in">
        <router-view></router-view>
      </transition>
    </v-main>
    <v-snackbar bottom right v-model="snackbar">
      {{text}}
    </v-snackbar>
  </v-app>
</template>
<script>
export default {
  name: 'App',
  components: {
  },
  data() {
    return {
      navigationItems: [
        { title: 'Home', href:'/', icon: 'mdi-home'},
        // { title: 'Testing tab', href:'/test', icon: 'mdi-test-tube' },
        { title: 'Leaderboard', href:'/leaderboard', icon: 'mdi-podium' },
        { title: 'Chat Room', href:'/chat', icon: 'mdi-chat' },
      ],
      drawer: false,
      snackbar: false,
      text: null
    }
  },methods:{
    darkMode(){
      var vm = this
      vm.$vuetify.theme.dark = !vm.$vuetify.theme.dark //update the website theme
      localStorage.darkMode = vm.$vuetify.theme.dark //update the local theme\
      vm.$socket.client.emit('updateUser', {darkmode: vm.$vuetify.theme.dark})
    },
  },
  mounted(){
    var vm = this
    vm.$socket.client.on('userLoggedIn', (username) =>{
      if (username==null)
        return
      vm.text = username + ' logged in'
      vm.snackbar = true
    })
  },
  beforeDestroy(){
    var vm = this
    vm.$socket.client.off('userLoggedIn')
  }
}
</script>

<style>
html, body, #app{
  height: 100%;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
html {
  overflow: hidden !important;
}
#app {
  overflow: auto !important;
}
.fade-leave-active {
  transition: opacity .25s;
}
.fade-enter-active {
  transition: opacity 1.5s;
}
.fade-leave-to, .fade-enter {
  opacity: 0;
}
.fade-enter-to, .fade-leave {
  opacity: 1;
}
</style>