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
            <v-text-field v-on:keyup.enter="submit" label="Public Username" autocomplete="off" counter="20" v-model="newUsername" :error-messages="error" :success-messages="success" :rules="usernameRules" @input="error=null; success=null; test()" @blur="resetField"/>
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
import { debounce } from 'debounce'
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
      newUsername: null
    }
  },
  methods: {
    test: debounce(function () {
      var vm = this
      if(vm.newUsername == '' || vm.newUsername.length<3 || vm.newUsername.length>20 || !/^[a-zA-Z][a-zA-Z0-9.-]*$/g.test(vm.newUsername) || vm.newUsername == vm.$store.state.username)
        return  
      vm.$socket.client.emit('checkUsername', vm.newUsername, res=>vm.error = res.taken ? 'That username is already taken': null)
    }, 250),
    async signOut(){
      var vm = this
      await vm.$store.dispatch('signOut')
      vm.$router.push('/')
    },
    async submit(){
      var vm = this
      if(vm.newUsername == '' || vm.newUsername.length<3 || vm.newUsername.length>20 || !/^[a-zA-Z][a-zA-Z0-9.-]*$/g.test(vm.newUsername) || vm.error || vm.newUsername == vm.$store.state.username)
        return
      vm.$socket.client.emit('updateUser', {username: vm.newUsername}, res=>{
        if(res.ok){
          vm.success=`Your username is now ${vm.newUsername}`
          vm.$store.state.username = vm.newUsername
        }
        else 
          vm.error="Something went wrong..."
      })
    },
    resetField(){
      var vm = this
      vm.error=null
      vm.newUsername = vm.$store.state.username
    },
  },
  created(){
    var vm = this
    if(vm.$store.state.username != null)
      return vm.newUsername = vm.$store.state.username
    vm.unwatch = this.$store.watch(
      (state) => state.username,
      (newValue) => {
        vm.newUsername = newValue
        vm.unwatch()
      },
    );
  }
}
</script>

<style scoped>
</style>