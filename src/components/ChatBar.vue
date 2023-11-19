<template lang="pug">
v-row(no-gutters align="end")
  v-col(cols="11")
    v-textarea(v-model="message" label="Message" auto-grow :rows="1" :max-rows="5" @keydown.enter="handleEnter")
  v-col(cols="1" class="d-flex align-center justify-space-between")
    v-btn(icon @click="sendMessage" class="btn")
      v-icon mdi-send
    v-menu(v-model="menu" :close-on-content-click="false" offset-y)
      template(v-slot:activator="{ props }")
        v-btn(icon v-bind="props" class="btn")
          v-icon mdi-dots-vertical
      v-card(min-width="225" height="65" )
        v-list
          v-list-item
            v-row
              v-col(cols="9")
                v-list-item-title(class="scrollOnMessageTitle") Scroll on Message
              v-col(cols="3")
                v-list-item-action
                  v-switch(v-model="preferences.scrollOnMessage" density="compact")
</template>

<script setup>
import { useMutation } from '@vue/apollo-composable'
import { gql } from '@apollo/client/core'
import { inject, ref } from 'vue'

const { mutate: sendMessageMutation } = useMutation(
  gql`
    mutation SendMessage($message: String!) {
      sendMessage(message: $message) {
        id
        content
      }
    }
  `
)
const message = ref('')
const preferences = inject('preferences')
const menu = ref(false)

async function sendMessage() {
  if (typeof message.value === 'string' && message.value.trim() !== '') {
    await sendMessageMutation({ message: message.value })
    message.value = ''
  }
}

function handleEnter(event) {
  if (event.altKey || event.metaKey || event.shiftKey) {
    event.preventDefault()
    message.value += '\n'
  } else {
    event.preventDefault()
    sendMessage()
  }
}
</script>

<style lang="stylus">
.v-footer
  position fixed
  bottom 0
  width 100%

.btn
  margin-bottom 25px
  margin-left 10px

.scrollOnMessageTitle
  margin-top 8px
</style>