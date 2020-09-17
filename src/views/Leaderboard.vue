<template>
  <v-container class="fill-height">
    <v-row class="fill-height"> 
      <v-col class="fill-height d-flex flex-column">
        <v-row class="shrink"> 
          <v-col>
            <v-text-field label="Search for user" autocomplete="off" v-model="search" prepend-inner-icon="mdi-magnify" v-debounce="searchUsers" clearable hide-details/>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-data-table class="fill-height" :headers="headers" hide-default-footer :items-per-page="-1" :loading="loading" :items="results || []" disable-sort>
              <template v-slot:top>
                <v-card flat class="ma-2 pt-2 text-h4 text-center">
                  Leaderboard<v-btn icon :color="outOfDate ? 'warning' : null" @click="searchUsers"><v-icon>mdi-reload</v-icon></v-btn>
                </v-card>
              </template>
            </v-data-table>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
export default {
  data(){
    return {
      headers: [
        { text: 'Rank', value: 'rank' },
        { text: 'Username', value: 'username' },
        { text: 'Money', value: 'money' },
      ],
      search: null,
      results: null,
      loading: true,
      outOfDate: false
    }
  },
  methods: {
    async searchUsers(){
      var vm = this
      vm.loading = true
      vm.$socket.client.emit('getUsers', vm.search, res=>{
        vm.results = res
        vm.outOfDate = false
        vm.loading = false
      })
    }
  },
  mounted(){
    var vm = this
    vm.searchUsers()
    vm.$socket.$subscribe('updatedpublic', () =>{
      vm.outOfDate = true
    })
  },
  beforeDestroy(){
    var vm = this
    vm.$socket.$unsubscribe('updatedpublic')
  }
}
</script>