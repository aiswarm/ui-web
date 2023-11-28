<template lang="pug">
v-card
    GroupList
    AgentList
</template>

<script setup>
import GroupList from '@/components/GroupList.vue'
import AgentList from '@/components/AgentList.vue'
</script>

<style lang="stylus">
h3 {
  margin: 10px 10px 0
}

.selected-chat {
  font-weight: bold
}

.badge > .v-list-item__content
  overflow visible !important
</style>