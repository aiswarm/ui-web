<template lang="pug">
v-app
  v-navigation-drawer(v-model="drawer" app)
    Sidebar
  v-main
    v-container(fluid=true)
      v-row
        v-col(cols="12")
          v-row(height="100%" justify="center" align="center")
            ChatLog
  v-footer(app).fixed.bottom
    ChatBar
</template>

<script>
import Sidebar from './components/SideBar.vue'
import ChatLog from './components/ChatLog.vue'
import ChatBar from './components/ChatBar.vue'
import {
  agents,
  defaultGroup,
  drivers,
  groups,
  loadCurrentState,
  message,
  messages,
  skills,
  subscribeToAgents,
  subscribeToGroups,
  subscribeToMessages
} from './subscriptions.js'
import {provide, ref} from 'vue'

export default {
  components: {
    Sidebar,
    ChatLog,
    ChatBar
  },
  setup() {
    const targetSelected = ref({type: 'group', name: defaultGroup})

    loadCurrentState()
    subscribeToGroups()
    subscribeToAgents()
    subscribeToMessages()

    provide('messages', messages)
    provide('message', message)
    provide('agents', agents)
    provide('groups', groups)
    provide('defaultGroup', defaultGroup)
    provide('drivers', drivers)
    provide('targetSelected', targetSelected)
    provide('skills', skills)
  },
  data: () => ({
    drawer: null
  })
}
</script>

<style lang="stylus">
.v-footer
  position fixed
  bottom 0
  width 100%
</style>