<template>
  <v-container class="fill-height" fluid>
    <v-row class="fill-height"> 
      <v-col class="fill-height d-flex flex-column">
        <v-row class="shrink"> 
          <v-col>
            <v-text-field label="Search for user" autocomplete="off" v-model="search" @input="searchUsers"/>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-data-table class="fill-height" :headers="headers" hide-default-footer :items-per-page="-1" :loading="results==null" :items="results || []" disable-sort>
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
      results: null
    }
  },
  methods: {
    async searchUsers(){
      var vm = this
      vm.results = null
      await vm.$database.getUsers(vm.search ? vm.search : null).then(res=>vm.results=res)
    }
  },
  async mounted(){
    var vm = this
    vm.searchUsers()
  }
}
</script>