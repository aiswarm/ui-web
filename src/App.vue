<template lang="pug">
v-app
  v-navigation-drawer(v-model="drawer" app)
    Sidebar(@chat-selected="selectChat")
  v-main
    v-container(fluid)
      v-row
        v-col(cols="12")
          v-row(height="100%" justify="center" align="center")
            ChatLog(:selected="selected")
  v-footer(app).fixed.bottom
    ChatBar
</template>

<script>
import Sidebar from './components/SideBar.vue'
import ChatLog from './components/ChatLog.vue'
import ChatBar from './components/ChatBar.vue'

export default {
  components: {
    Sidebar,
    ChatLog,
    ChatBar,
  },
  data: () => ({
    drawer: null,
    selected: null,
  }),
  methods: {
    /**
     * @param {Object} chat
     * @param {string} chat.name
     * @param {string} chat.type
     */
    selectChat(chat) {
      this.selected = chat
    },
  },
}
</script>