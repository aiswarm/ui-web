<template lang="pug">
div
  h2 Groups
  ul(v-if="groups.length")
    li(v-for="group in groups" :key="group.name") {{ group.name }}
  h2 Agents
  ul(v-if="agents.length")
    li(v-for="agent in agents" :key="agent.name") {{ agent.name }}
</template>

<script setup>
import { useQuery } from '@vue/apollo-composable'
import { gql } from '@apollo/client/core'
import { ref, watchEffect } from 'vue'

// eslint-disable-next-line no-unused-vars
const { result: groupsResult, onResult: onGroupsResult } = useQuery(
  gql`
    query {
      groups {
        name
      }
    }
  `
)
// eslint-disable-next-line no-unused-vars
const { result: agentsResult, onResult: onAgentsResult } = useQuery(
  gql`
    query {
      agents {
        name
      }
    }
  `
)

const groups = ref([])
const agents = ref([])

watchEffect(() => {
  onGroupsResult((result) => {
    if (result.data) {
      groups.value = result.data.groups
    }
  })
})

watchEffect(() => {
  onAgentsResult((result) => {
    if (result.data) {
      agents.value = result.data.agents
    }
  })
})
</script>

<style lang="stylus"></style>