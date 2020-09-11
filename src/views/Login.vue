<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <v-card class="ma-2" :elevation="5" v-if="$store.state.isSignedIn">
          <div class="overline mt-2 ml-2">ACCOUNT INFO</div>
          <v-list-item>
            <v-list-item-avatar size="80" class="ma-2"><v-img :src="$store.state.googleProfile.getImageUrl()" :height="80" :width="80"/></v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title class="headline mb-1">{{$store.state.googleProfile.getName()}}</v-list-item-title>
              <v-list-item-subtitle>{{$store.state.googleProfile.getEmail()}}</v-list-item-subtitle>
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
        value=>value == '' || value == null || value.length>2 || 'Username must at least 3 characters',
        value=>value == '' || value == null || value.length<21 || 'Maximum 20 characters',
        value=>value == '' || value == null || /^[a-zA-Z]/g.test(value) || 'Username must begin with a letter',
        value=>value == '' || value == null || /^[a-zA-Z][a-zA-Z0-9.-]*$/g.test(value) || 'Username can only contain letters, numbers, -, and .',
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
      console.log("signIn() from login.vue")
      this.username=this.$store.state.username
    },
    signOut(){
      var vm = this
      vm.username = ''
      vm.error = null
      vm.success = null
    },
    async submit(){
      var vm = this
      if(vm.username == '' || vm.username.length<3 || vm.username.length>20 || !/^[a-zA-Z][a-zA-Z0-9.-]*$/g.test(vm.username))
        return
      vm.$database.updateUser({username: vm.username})
      .then(res=>{
        console.log(res)
        if(res.data.code == 0){
          vm.success=`Your username is now ${vm.username}`
          vm.$store.state.username = vm.username
        }
        else if (res.data.code == 23505)
          vm.error=`The username ${vm.username} is already taken`
        else 
          vm.error="Something went wrong..."
      })
    },
  },
  async mounted(){
    var vm = this
    if(this.$route.query.redirect){
      await vm.$store.commit('signIn')
      this.$router.push(this.$route.query.redirect)
    }
    await vm.$database.getUser().then(res=>{
      vm.username = res.username
    })
  }
}
</script>

<style scoped>
</style>