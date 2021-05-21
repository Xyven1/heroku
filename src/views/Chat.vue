<template>
  <v-container class="fill-height">
    <v-col class="pa-0 fill-height">
      <v-row>
        <v-col>
          <v-card class="fill-height pa-2">
            <vue-custom-scrollbar ref="scroll" style="height: 50vh; position: relative; right: -8px" class="pr-3" :settings="{suppressScrollX: true}" @ps-scroll-down.passive="scrollDown">
              <v-row color="transparent" v-for="(message, index) in messageCache" :key="index">
                <v-col class="pt-0" v-if="message.message">
                  <div :class="{'text-right':message.user.userid==$store.state.userid}" class="caption grey--text">{{new Date(message.timestamp).toLocaleTimeString('en-US')}}</div>
                  <v-card tile :color="message.user.userid==$store.state.userid ? 'primary' : 'secondary'" dark class="pa-2 rounded-t-lg show-space"
                  width="45%" :class="{'float-right':message.user.userid==$store.state.userid, 'rounded-bl-lg':message.user.userid==$store.state.userid, 'rounded-br-lg':message.user.userid!=$store.state.userid}">
                    <div class="overline mt-n3" v-if="message.user.userid!=$store.state.userid">{{message.user.username || "Anon"}}</div>
                    {{message.message}}
                  </v-card>
                </v-col>
                <v-col v-if="message.join" class="text-center subtitle-1 mt-0">
                  {{message.user.username || "Anon"}} joined the chat
                </v-col>
                <v-col v-if="message.leave" class="text-center subtitle-1 mt-0">
                  {{message.user.username || "Anon"}} left the chat
                </v-col>
              </v-row>
            </vue-custom-scrollbar>
            <v-alert dense text v-if="newMessage" z-index="1" class="alert text-center pa-1">New messages <v-icon @click.stop="scrollToBottom()">mdi-arrow-down</v-icon></v-alert>
          </v-card>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-textarea auto-grow rows="1" placeholder="Type here" v-model="message"  append-icon="mdi-send" @click:append="sendMessage"
          @focus="isMobile ? scrollToBottom(1) : ()=>{}" @keydown.enter.exact.prevent="isMobile ? null : sendMessage()" ref="input"/>
        </v-col>
      </v-row>
    </v-col>
  </v-container>
</template>
<script>
import {isMobile} from 'mobile-device-detect'
import vueCustomScrollbar from 'vue-custom-scrollbar'
export default {
  components: {
    vueCustomScrollbar
  },
  data() {
    return {
      message: null,
      messageCache: [],
      newMessage: false,
      isMobile
    }
  },
  methods: {
    sendMessage(){
      var vm = this
      if(vm.message=='' || vm.message==null) return
      vm.messageCache.push({message: vm.message, user: {userid:vm.$store.state.userid, username: vm.$store.state.username}, timestamp: Date.now()})
      vm.scrollToBottom()
      vm.$socket.client.emit('sendMessage', vm.message)
      vm.message = null
    },
    scrollToBottom(check = false){
      var vm = this
      var c = vm.$refs.scroll.$el
      if(check && c.scrollHeight - c.offsetHeight - c.scrollTop>600) return
      vm.$nextTick().then(()=>{
        c.scrollTop = c.scrollHeight
      })
      vm.newMessage = false
    },
    scrollDown(){
      var vm = this
      var c = vm.$refs.scroll.$el
      if(c.scrollHeight - c.offsetHeight - c.scrollTop<25)
        vm.newMessage = false
    }
  },
  mounted(){
    var vm = this
    vm.$socket.client.emit('joinedChat', (history)=>{
      vm.messageCache = history
      vm.scrollToBottom()
    })
    vm.$socket.client.on('chat', (data)=>{
      vm.messageCache.push(data)
      if (vm.messageCache.length > 200) vm.messageCache.shift()
      if(data.leave || data.join) return
      var c = vm.$refs.scroll.$el
      if(c.scrollHeight - c.offsetHeight - c.scrollTop>100)
        vm.newMessage = true
      else
        vm.scrollToBottom()
    })
  },
  beforeDestroy(){
    var vm = this
    vm.$socket.client.emit('leftChat')
    vm.$socket.client.off('chat')
  }
}
</script>
<style>
code {
  background-color: rgba(0,0,0,0.3) !important;
  color: lightgrey !important;
  border-style: solid !important;
  border-width: 1px !important;
  border-color: black !important;
  padding: .2em .4em !important;
}
.show-space{
  white-space: pre-wrap;
}
.alert{
  margin-bottom: 0px !important;
  margin-top: -32px !important;
  font-size: 13px !important;
}
</style>