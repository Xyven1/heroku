<template>
  <v-app id="app">
    <v-navigation-drawer app permanent width="190" dark color="blue">
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
      <template v-slot:append>
        <v-list nav>
          <v-list-item to="/login" class="pl-1">
            <v-list-item-icon class="ma-2 ml-0">
              <v-avatar :size="33">
                <v-img :src="$store.state.profile ? $store.state.profile.getImageUrl() : 'loading'">
                  <v-icon v-if="!$store.state.profile">mdi-account</v-icon>
                </v-img>
              </v-avatar>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>{{$store.state.profile ? $store.state.profile.getName() : "Login"}}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </template>
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
        { title: 'Testing tab', href:'/test', icon: 'mdi-test' },
      ],
    };
  },
  methods: {
  },
  mounted(){
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