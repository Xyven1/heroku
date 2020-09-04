<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <v-card class="ma-2" :elevation="5" width="300" v-if="$store.state.profile">
          <div class="overline mt-2 ml-2">ACCOUNT INFO</div>
          <v-list-item>
            <v-list-item-avatar size="80" class="ma-2"><v-img :src="$store.state.profile.getImageUrl()" :height="80" :width="80"/></v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title class="headline mb-1">{{$store.state.profile.getName()}}</v-list-item-title>
              <v-list-item-subtitle>{{$store.state.profile.getEmail()}}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-card>
        <sign-in-button ref="SignIn" class="ma-2" color="blue" :dark="true" :onSignIn="signIn" :onSignOut="signOut"/>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import SignInButton from '../components/SignInButton.vue';
export default {
  components: {
    SignInButton
  },
  methods: {
    signIn(){
      // this.$router.push(this.$route.query.redirect || '/')
    },
    signOut(){
    }
  },
  async mounted(){
    await this.$auth.then(async auth =>{
      if (!auth.isSignedIn.get() && this.$route.query.redirect){
        await auth.signIn()
        this.$store.commit('signIn')
        this.$router.push(this.$route.query.redirect)
      }
    }).catch((e)=>console.log(e))
  }
}
</script>

<style scoped>
</style>