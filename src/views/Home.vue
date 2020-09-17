<template>
  <v-container class="fill-height">
    <v-col class="pa-0 fill-height d-flex flex-column">
      <v-row class="shrink">
        <v-col class="text-h2 text-center">
          This is a very interesting site, I swear
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-card flat class="fill-height pa-10 text-h4 text-center"> Nothing is worth seeing here, but check out the cool <a @click="$router.push('/leaderboard')"><u>leaderboard</u></a></v-card>
        '</v-col>
      </v-row>
    </v-col>
  </v-container>
</template>

<script>
export default {
  components: {
  },
  methods:{
  },
}
</script>

<style scoped>

</style>