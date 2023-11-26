<template lang="pug">
v-app-bar(app color="primary" dark)
  v-toolbar-title {{ targetSelected?.name || 'all' }}
div.chat-log
  ul(v-if="localMessages.length")
    li(v-for="(messageInput, index) in localMessages" :key="messageInput.id" :ref="setLastMessageRef")
      span.source {{ messageInput.source }}:
      span.content {{ messageInput.content }}
      span.timestamp {{ new Date(messageInput.timestamp).toLocaleTimeString() }}
</template>

<script setup>
import { inject, nextTick, ref, watchEffect } from 'vue'

const messages = inject('messages')
const targetSelected = inject('targetSelected')

const localMessages = ref([])
const lastMessage = ref(null)

const setLastMessageRef = (el) => {
  if (el) {
    lastMessage.value = el
  }
}

watchEffect(() => {
  localMessages.value = messages.value.filter(
    (message) =>
      targetSelected.value?.name === 'all' ||
      message.target === targetSelected.value?.name ||
      message.source === targetSelected.value?.name
  )

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
</style>