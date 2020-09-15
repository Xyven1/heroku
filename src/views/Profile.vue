<template>
  <v-container>
    <v-row>
      <v-col>
        <v-card class="ma-2" :elevation="5" v-if="$store.state.isSignedIn">
          <v-list-item>
            <v-list-item-avatar size="80" class="ma-2"><v-img :src="$store.state.googleProfile.getImageUrl()" :height="80" :width="80"/></v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title class="headline mb-1">{{$store.state.googleProfile.getName()}}</v-list-item-title>
              <v-list-item-subtitle>{{$store.state.googleProfile.getEmail()}}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-text-field v-on:keyup.enter="submit" label="Public Username" counter="20" v-model="$store.state.username" :error-messages="error" :success-messages="success" :rules="usernameRules" @input="error=null; success=null;"/>
          </v-list-item>
          <v-btn color="primary" @click="signOut" class="ma-2">
            <v-icon>mdi-logout</v-icon> Logout
          </v-btn>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data (){
    return {
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
  methods: {
    async signOut(){
      var vm = this
      await vm.$store.dispatch('signOut')
      vm.$router.push('/')
    },
    async submit(){
      var vm = this
      if(vm.$store.state.username == '' || vm.$store.state.username.length<3 || vm.$store.state.username.length>20 || !/^[a-zA-Z][a-zA-Z0-9.-]*$/g.test(vm.$store.state.username))
        return
      vm.$axios.post('/database/user', {username: vm.$store.state.username})
      .then(res=>{
        console.log(res)
        if(res.data.code == 0)
          vm.success=`Your username is now ${vm.$store.state.username}`
        else if (res.data.code == 23505)
          vm.error=`The username ${vm.$store.state.username} is already taken`
        else 
          vm.error="Something went wrong..."
      })
    },
  },
  async mounted(){
  }
}
</script>

<style scoped>
</style>