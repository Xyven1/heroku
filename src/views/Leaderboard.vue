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
            <v-data-table :headers="headers" hide-default-footer :items-per-page="-1" :loading="loading" :items="results || []" disable-sort>
              <template v-slot:top>
                <v-card flat class="pt-2 text-h4 text-center">
                  Leaderboard<v-btn icon :color="outOfDate ? 'warning' : null" @click="searchUsers"><v-icon>mdi-reload</v-icon></v-btn>
                </v-card>
              </template>
              <template v-slot:body="{items}">
                <v-card :class="{'primary-transparent': index % 2 == 1}" style="display: table-row;" v-for="(item, index) in items" :key="index">
                  <td class="pa-3 text-center">
                    {{item.rank}}
                  </td>
                  <td class="pa-3">
                    {{item.username}}
                  </td>
                  <td class="pa-3">
                    {{'$' + parseFloat(item.money).toFixed(2)}}
                  </td>
                </v-card>
              </template>
            </v-data-table>
            <!-- <v-card flat class="pa-2 text-center" style="overflow-y: auto;" height="100%">
              <v-row>
                <v-col class="text-h4 text-center">
                  Leaderboard
                  <v-btn icon :color="outOfDate ? 'warning' : null" @click="searchUsers"><v-icon large>mdi-reload</v-icon></v-btn>
                </v-col>
              </v-row>
              <v-row class="ml-2 mr-2">
                <v-col class="text-center headerText" cols="2">
                  Rank
                </v-col>
                <v-col class="headerText">
                  username
                </v-col>
                <v-col class="headerText">
                  money
                </v-col>
              </v-row>
              <v-divider/>
                <v-card v-for="(item, index) in results" :key="index" class="ma-2 mb-4 mt-4" elevation="8" >
                  <v-row width="100%" class="ma-0"> 
                      <v-col class="text-center pt-4 pb-4" cols="2">
                          {{item.rank}}
                      </v-col>
                      <v-col class="pt-4 pb-4">
                        {{item.username}}
                      </v-col>
                      <v-col class="pt-4 pb-4"> 
                        {{'$' + parseFloat(item.money).toFixed(2)}}
                      </v-col>
                  </v-row>
                </v-card>
            </v-card> -->
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
        { text: 'Rank', value: 'rank', width: 50, align: 'center', class: 'title'},
        { text: 'Username', value: 'username', class: 'title'},
        { text: 'Money', value: 'money', class: 'title'},
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
<style scoped>
.headerText{
  text-transform: uppercase;
  letter-spacing: 2px;
  font-size: 1em
}
.primary-transparent{
  background-color: #1976d21a;
}
</style>