<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <v-card class="ma-2" :elevation="5" v-if="$store.state.profile">
          <div class="overline mt-2 ml-2">ACCOUNT INFO</div>
          <v-list-item>
            <v-list-item-avatar size="80" class="ma-2"><v-img :src="$store.state.profile.getImageUrl()" :height="80" :width="80"/></v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title class="headline mb-1">{{$store.state.profile.username || $store.state.profile.getName()}}</v-list-item-title>
              <v-list-item-subtitle>{{$store.state.profile.getEmail()}}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-text-field label="Public Username" counter="20" v-model="username" :error-messages="error" :success-messages="success" :rules="usernameRules" @input="error=null; success=null"/>
            <v-btn @click="submit">Submit</v-btn>
          </v-list-item>
        </v-card>
        <sign-in-button ref="SignIn" class="ma-2" color="primary" :dark="true" :onSignIn="signIn" :onSignOut="signOut"/>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import SignInButton from '../components/SignInButton.vue';
export default {
  data (){
    return {
      username: '',
      success: null,
      error: null,
      usernameRules: [
        value=>value == '' || value.length>2 || 'Username must at least 3 characters',
        value=>value == '' || value.length<21 || 'Maximum 20 characters',
        value=>value == '' || /^[a-zA-Z]/g.test(value) || 'Username must begin with a letter',
        value=>value == '' || /^[a-zA-Z][a-zA-Z0-9.-]*$/g.test(value) || 'Username can only contain letters, numbers, -, and .',
      ],
    }
  },
  components: {
    SignInButton
  },
  computed: {
  },
  methods: {
    signIn(){
      this.username = this.$store.state.profile.username
    },
    signOut(){
      this.username=null
    },
    async submit(){
      var vm = this
      if(vm.username == '' || vm.username.length<3 || vm.username.length>20 || !/^[a-zA-Z][a-zA-Z0-9.-]*$/g.test(vm.username))
        return
      await vm.$auth.then(async auth =>{
        vm.$axios.post('/database/user', {
          idtoken: auth.currentUser.get().getAuthResponse().id_token,
          username: vm.username
        }).then(res=>{
          console.log(res)
          if(res.data.code == 0)
            vm.success=`Your username is now ${vm.username}`
          else if (res.data.code == 23505)
            vm.error=`The username ${vm.username} is already taken`
          else 
            vm.error="Something went wrong..."
        })
      })
    },
  },
  async mounted(){
    var vm = this
    await vm.$auth.then(async auth =>{
      if (!auth.isSignedIn.get() && this.$route.query.redirect){
        await auth.signIn()
        await vm.$store.commit('signIn')
        this.$router.push(this.$route.query.redirect)
      }
    }).catch((e)=>console.log(e))
    vm.username = vm.$store.state.profile.username || ''
  }
}
</script>

<style scoped>
</style>