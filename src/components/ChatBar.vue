<template lang="pug">
v-row(no-gutters align="end")
  v-col(cols="11")
    v-snackbar(v-model="snackbar" color="error" :timeout="3000" close-on-content-click=true location="top" ) Cannot send message to map agents, please select an agent or group
    v-textarea(id="messageInput" v-model="messageInput" label="Message" auto-grow :rows="1" :max-rows="5" @keydown.enter="handleEnter" :disabled="!enabled" clearable=true )
  v-col(cols="1" class="d-flex align-center justify-space-between")
    v-btn(icon @click="sendMessage" class="btn" :disabled="!enabled")
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
import {inject, ref, watch} from 'vue'
import {useMutation} from '@vue/apollo-composable'
import {gql} from '@apollo/client/core'
import {defaultGroup} from '../subscriptions.js'

const targetSelected = inject('targetSelected')
const preferences = inject('preferences')

const messageInput = ref('')
const menu = ref(false)
const enabled = ref(true)
const snackbar = ref(false)

const {mutate: sendMessageMutation} = useMutation(
  gql`
    mutation SendMessage($message: String!, $target: String!) {
      sendMessage(message: $message, target: $target) {
        id
        content
      }
    }
  `
)

async function sendMessage() {
  if (
    typeof messageInput?.value === 'string' &&
    messageInput.value.trim() !== ''
  ) {
    await sendMessageMutation({message: messageInput.value, target: targetSelected.value.name})
    messageInput.value = ''
  }
}

watch(targetSelected.value, (value) => {
  enabled.value = !(!value || value.name === defaultGroup)
})

async function handleEnter(event) {
  event.preventDefault()
  if (event.altKey || event.metaKey || event.shiftKey) {
    messageInput.value += '\n'
    return
  }
  const target = targetSelected.value.name
  if (target === defaultGroup) {
    snackbar.value = true
    return
  }
  const message = messageInput.value
  if (message.trim && message.trim() !== '' && target) {
    await sendMessageMutation({message, target})
    messageInput.value = ''
  }
}
</script>

<style lang="stylus">
.btn
  margin-bottom 5px
  margin-left 10px

.scrollOnMessageTitle
  margin-top 8px

.v-input__details
  display none !important
</style>