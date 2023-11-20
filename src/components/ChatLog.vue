<template lang="pug">
div.chat-log
  v-app-bar(app color="primary" dark)
    v-toolbar-title Chat Application
  ul(v-if="messages.length")
    li(v-for="(message, index) in messages" :key="message.id" :ref="setLastMessageRef") {{ message.content }}
</template>

<script setup>
import { useQuery, useSubscription } from '@vue/apollo-composable'
import { inject, nextTick, ref, watchEffect } from 'vue'
import { gql } from '@apollo/client/core'

// Query for getting the initial messagesq
const { result: messagesResult } = useQuery(
  gql`
    query {
      messages {
        id
        content
      }
    }
  `
)

// Subscription for getting new messages
const { result: newMessageResult } = useSubscription(
  gql`
    subscription {
      messageSent {
        id
        content
      }
    }
  `
)

const messages = ref([])
const lastMessage = ref(null)
const preferences = inject('preferences')

// eslint-disable-next-line no-unused-vars
const setLastMessageRef = (el) => {
  if (el) {
    lastMessage.value = el
  }
}

watchEffect(() => {
  // Update messages with the initial data
  if (messagesResult.value?.messages) {
    messagesResult.value.messages.forEach((message) => {
      if (!messages.value.find((m) => m.id === message.id)) {
        messages.value.push(message)
      }
    })
  }

  // Update messages with the new message
  if (newMessageResult.value?.messageSent) {
    if (
      !messages.value.find(
        (m) => m.id === newMessageResult.value.messageSent.id
      )
    ) {
      messages.value.push(newMessageResult.value.messageSent)
    }
    nextTick(() => {
      if (lastMessage.value && preferences.scrollOnMessage) {
        lastMessage.value.scrollIntoView({ behavior: 'smooth' })
      }
    })
  }
})
</script>

<style lang="stylus">
.chat-log
  height 100%
  overflow-y auto
  display flex
  flex-direction column-reverse
</style>