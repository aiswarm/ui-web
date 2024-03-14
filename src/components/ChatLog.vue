<template lang="pug">
v-app-bar(app color="primary" dark)
  v-toolbar-title {{ targetSelected?.name || defaultGroup }}
div.chat-log
  ul(v-if="localMessages.length")
    li(v-for="(messageInput, index) in localMessages" :key="messageInput.id" :ref="setLastMessageRef")
      template(v-if="messageInput.type === 'string'")
        span.source {{ messageInput.source }}:
        span.content {{ messageInput.content }}
        span.timestamp {{ new Date(messageInput.timestamp).toLocaleTimeString() }}
        span.status
          v-icon.mdi-spin(v-if="messageInput.status === 'processing' || messageInput.status === 'queued'" :title="messageInput.status") mdi-loading
          v-icon(v-if="messageInput.status === 'complete'" :title="messageInput.status") mdi-check
          v-icon(v-if="messageInput.status === 'error' || messageInput.status === 'cancelled'" :title="messageInput.status") mdi-close
      template(v-else-if="messageInput.type === 'skill'")
        div.skill Executing skill {{ messageInput.content }}
          v-icon.mdi-spin(v-if="messageInput.status === 'processing'" :title="messageInput.status") mdi-progress-wrench
          v-icon(v-if="messageInput.status === 'completed'" :title="messageInput.status") mdi-check
          v-icon(v-if="messageInput.status === 'failed' || messageInput.status === 'cancelled'" :title="messageInput.status") mdi-close
          v-tooltip(activator="parent" location="bottom start" origin="auto" scroll-strategy="reposition" openOnHover)
            div.param(v-for="(value, key) in messageInput.metadata", :key="key")
              span.key {{ key }}:
              span.value {{ value }}
</template>

<script setup>
import {inject, nextTick, ref, watchEffect} from 'vue'
import {defaultGroup} from '../subscriptions.js'

const messages = inject('messages')
const targetSelected = inject('targetSelected')
const skillEvents = inject('skillEvents')

const localMessages = ref([])
const lastMessage = ref(null)
const metadata = ref('')

const setLastMessageRef = (el) => {
  if (el) {
    lastMessage.value = el
  }
}

watchEffect(() => {
  localMessages.value = messages.value.filter(
    (message) =>
      targetSelected.value?.name === defaultGroup ||
      message.target === targetSelected.value?.name ||
      message.source === targetSelected.value?.name
  ).map((message) => {
    if (message.type === 'skill') {
      return {
        ...message,
        metadata: message.metadata.reduce((acc, {key, value}) => {
          acc[key] = value
          return acc
        }, {})
      }
    }
    return message
  })

  nextTick(() => {
    if (lastMessage.value) {
      lastMessage.value.scrollIntoView()
    }
  })
})
</script>

<style lang="stylus">
.chat-log
  bottom 0
  padding-bottom 100px
  overflow-y auto
  scroll-behavior smooth
  height 100%
  display flex
  flex-direction column-reverse
  position fixed

.source
  font-weight bold
  margin-right 10px

.content
  margin-right 10px

.timestamp
  font-size 0.8em
  color gray

.status
  font-size 0.8em
  color gray
  font-align top

.skill
  font-size 0.8em
  color gray
  font-align top
  padding-left 10px

.param
  font-size 0.9em

  .key
    font-weight bold

  .value
    margin-left 5px
</style>