<template>
  <v-app id="app">
    <v-app-bar app dense>
      <v-app-bar-nav-icon @click="drawer=true"></v-app-bar-nav-icon>
      <v-toolbar-title>Testing site</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn to="/login" elevation="0">
        <v-list-item-content class="pr-2">
          {{$store.state.isSignedIn ? $store.state.username || $store.state.googleProfile.getName() : "Login"}}
        </v-list-item-content>
        <v-avatar :size="33">
          <v-img :src="$store.state.isSignedIn ? $store.state.googleProfile.getImageUrl() : 'loading'">
            <v-icon v-if="!$store.state.isSignedIn">mdi-account</v-icon>
          </v-img>
        </v-avatar>
      </v-btn>
      <v-menu offset-y transition="slide-y-transition" :close-on-content-click="false">
        <template v-slot:activator="{ on: menu, attrs }">
          <v-tooltip bottom>
            <template v-slot:activator="{ on: tooltip }">
              <v-btn icon v-bind="attrs" v-on="{ ...tooltip, ...menu }">
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </template>
            <span>Settings</span>
          </v-tooltip>
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
        { title: 'Testing tab', href:'/test', icon: 'mdi-test-tube' },
      ],
      drawer: false
    };
  },methods:{
    darkMode(){
      var vm = this
      vm.$vuetify.theme.dark = !vm.$vuetify.theme.dark
      vm.$auth.then(auth => {
        if(auth.isSignedIn.get())
          vm.$database.updateUser({darkmode: vm.$vuetify.theme})
      })
      localStorage.darkMode = vm.$vuetify.theme.dark
    },
  },
  async mounted(){
    var vm = this
    await vm.$auth.then(async auth => {
      if(auth.isSignedIn.get()){
        await vm.$database.getUser().then(data=>{
          vm.$vuetify.theme.dark = data.darkmode
        })
      }
      else if(localStorage.darkMode)
        vm.$vuetify.theme.dark = localStorage.darkMode == "true"
    })
  },
}
</script>

<style>
@import url('https://fonts.googleapis.com/css?family=Oswald');
html, body, #app{
  height: 100%;
  font-family: 'Oswold', sans-serif;
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