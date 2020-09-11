<template>
  <div v-if="!loading">
    <v-btn :color="color" dark @click="signIn" v-if="!$store.state.isSignedIn">
      <v-icon v-if="icons">mdi-login</v-icon>
      Sign in
    </v-btn>
    <v-btn :color="color" dark @click="signOut" v-if="$store.state.isSignedIn">
      <v-icon v-if="icons">mdi-logout</v-icon>
      Logout
    </v-btn>
  </div>
</template>

<script>
export default {
  components: {
  },
  props: {
    color: {type: String, default: "blue"},
    dark: {type: Boolean, default: false},
    onSignIn: {type: Function, default: null},
    onSignOut: {type: Function, default: null},
    icons: {type: Boolean, default: true}
  },
  data(){ 
    return {
      loading: true,
    }
  },
  methods: {
    async signIn(){
      var vm = this
      console.log("singIn() from SignInButton.vue")
      await vm.$store.commit('signIn')
      console.log("after await in SignInButton.vue")
      vm.onSignIn()
    },
    async signOut(){
      var vm = this
      await vm.$store.commit('signOut')
      vm.onSignOut ? vm.onSignOut() : vm.$router.push('/login')
    },
  },
  async mounted(){
    this.$auth.then(() => this.loading=false)
  }
}
</script>

<style scoped>

</style>