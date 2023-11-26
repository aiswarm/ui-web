<template lang="pug">
v-app
  v-navigation-drawer(v-model="drawer" app)
    Sidebar
  v-main
    v-container(fluid)
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
import { useSubscription } from '@vue/apollo-composable'
import { gql } from '@apollo/client/core'
import { provide, ref, watchEffect } from 'vue'

export default {
  components: {
    Sidebar,
    ChatLog,
    ChatBar,
  },
  setup() {
    const messages = ref([])
    const agents = ref([])
    const drivers = ref([])
    const targetSelected = ref({ type: 'group', name: 'all' })
    const { result: newMessageResult } = useSubscription(
      gql`
        subscription {
          messageCreated {
            id
            timestamp
            source
            target
            content
            type
          }
        }
      `
    )

    watchEffect(() => {
      if (newMessageResult.value?.messageCreated) {
        messages.value.push(newMessageResult.value.messageCreated)
      }
    })

    provide('messages', messages)
    provide('agents', agents)
    provide('drivers', drivers)
    provide('targetSelected', targetSelected)
  },
  data: () => ({
    drawer: null,
  }),
}
</script>