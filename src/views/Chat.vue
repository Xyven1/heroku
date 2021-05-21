<template>
  <v-container class="fill-height">
    <v-col class="pa-0 fill-height">
      <v-row>
        <v-col>
          <v-card class="fill-height pa-2" >
            <vue-custom-scrollbar ref="scroll" style="height: 50vh; position: relative; right: -8px" class="pr-3" :settings="{suppressScrollX: true}">
              <v-row color="transparent" v-for="(message, index) in messageCache" :key="index">
                <v-col class="pt-0" v-if="message.message">
                  <div :class="{'text-right':message.user==null}" class="caption grey--text">{{new Date(message.timestamp).toLocaleTimeString('en-US')}}</div>
                  <v-card tile :color="message.user==null ? 'primary' : 'secondary'" dark class="pa-2 rounded-t-lg"
                  width="45%" :class="{'float-right':message.user==null, 'rounded-bl-lg':message.user==null, 'rounded-br-lg':message.user!=null}">
                    <div class="overline mt-n3" v-if="message.user!=null">{{message.user.username || "Anon"}}</div>
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
          </v-card>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-textarea auto-grow rows="1" placeholder="Type here" @keydown.enter.exact="sendMessage($event)" @keydown.shift.enter="()=>{}" ref="input"/>
        </v-col>
      </v-row>
    </v-col>
  </v-container>
</template>
<script>
import vueCustomScrollbar from 'vue-custom-scrollbar'
export default {
  components: {
    vueCustomScrollbar
  },
  data() {
    return {
      message: null,
      messageCache: [],
    }
  },
  methods: {
    sendMessage(e){
      var vm = this
      vm.$refs.input.internalValue = null
      e.preventDefault()
      var message = e.target.value
      if(message=='' || message==null) return
      vm.messageCache.push({message: message, user: null, timestamp: Date.now()})
      vm.scrollToBottom()
      vm.$socket.client.emit('sendMessage', message)
    },
    scrollToBottom(){
      var vm = this
      var c = vm.$refs.scroll.$el
      vm.$nextTick().then(()=>{
        c.scrollTop = c.scrollHeight
      })
    }
  },
  mounted(){
    var vm = this
    vm.$socket.client.emit('joinedChat', (history)=>{
      vm.messageCache = history
    })
    vm.$socket.client.on('chat', (data)=>{
      vm.messageCache.push(data)
      if (vm.messageCache.length > 200) vm.messageCache.shift()
      var c = vm.$refs.scroll.$el
      if(c.scrollHeight - c.offsetHeight - c.scrollTop>600) 
        vm.newMessage=true
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
</style>