<template>
  <v-container class="fill-height">
    <v-row class="fill-height"> 
      <v-col class="fill-height d-flex flex-column">
        <v-row class="shrink"> 
          <v-col>
            <v-text-field label="Search for user" autocomplete="off" v-model="search" @input="searchUsers" prepend-inner-icon="mdi-magnify" clearable hide-details/>
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
      await vm.$axios.get('/database/users', vm.search ? {params: {search: vm.search}} : null).then(res=>{
        vm.results = res.data
        vm.outOfDate = false
        vm.loading = false
      })
    }
  },
  mounted(){
    var vm = this
    vm.searchUsers()
    vm.sockets.subscribe('updatedpublic', () =>{
      vm.outOfDate = true
    })
  },
  destroyed(){
    var vm = this
    vm.sockets.unsubscribe('updatedpublic')
  }
}
</script>