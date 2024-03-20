<template lang="pug">
v-app-bar(app color="primary" dark)
  v-toolbar-title {{ targetSelected?.name || defaultGroup }}
div.chat-log
  ul(v-if="localMessages.length")
    li.message(v-for="(messageInput, index) in localMessages" :key="messageInput.id" :ref="setLastMessageRef")
      template(v-if="messageInput.type === 'string'")
        template(v-if="messageInput.source === 'user'")
          span.source.user {{ messageInput.source }}:
        template(v-else-if="messageInput.source === targetSelected.name")
          template(v-if="messageInput.target === 'user'")
            span.source.target {{ messageInput.source }}:
          template(v-else)
            span.source.target {{ messageInput.source }} -> {{ messageInput.target }}:
        template(v-else)
          span.source.other {{ messageInput.source }}: -> {{ messageInput.target }}:
        span.content(v-html="messageInput.content")
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

const boldRegexp = new RegExp(/\*\*([^*]+)\*\*/g)
const italicRegexp = new RegExp(/`([^`]+)`/g)

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
    return {
      ...message,
      content: formatContent(message.content)
    }
  })

  function formatContent(content) {
    let result = ''
    content.split('\n\n').forEach((line, index) => {
      result += `<p>${line.replace(boldRegexp, '<strong>$1</strong>').replace(italicRegexp, '<i>$1</i>')}</p>`
    })
    return result
  }

  nextTick(() => {
    if (lastMessage.value) {
      lastMessage.value.scrollIntoView()
    }
  })
})
</script>

<style lang="stylus">
.chat-log
  margin-top 80px
  scroll-behavior smooth

.message
  flex-direction row
  display flex

.source
  font-weight bold
  margin-right 10px
  &.user
    color #2b8cbe
  &.target
    color #b93232
  &.other
    color #666

.content
  margin-right 10px
  margin-bottom 0.5em
  display inline-block
  max-width 924px
  p
    margin-bottom 0.5em

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