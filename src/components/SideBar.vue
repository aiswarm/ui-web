<template lang="pug">
div
    h2 Groups
    ul(v-if="groups.length")
        li(v-for="group in groups" :key="group.name") {{ group.name }}
    v-btn(icon @click="addGroup") Add Group
    h2 Agents
    ul(v-if="agents.length")
        li(v-for="agent in agents" :key="agent.name") {{ agent.name }}
    v-btn(icon @click="addAgent") Add Agent
</template>

<script setup>
import { useMutation, useQuery, useSubscription } from '@vue/apollo-composable'
import { gql } from '@apollo/client/core'
import { ref, watchEffect } from 'vue'

const { result: groupsResult, onResult: onGroupsResult } = useQuery(
  gql`
    query {
      groups {
        name
      }
    }
  `
)

const { result: agentsResult, onResult: onAgentsResult } = useQuery(
  gql`
    query {
      agents {
        name
      }
    }
  `
)

const { mutate: addGroupMutation } = useMutation(
  gql`
    mutation CreateGroup($name: String!) {
      createGroup(name: $name)
    }
  `
)

const { mutate: addAgentMutation } = useMutation(
  gql`
    mutation CreateAgent($name: String!, $driver: String!) {
      createAgent(name: $name, driver: $driver) {
        name
      }
    }
  `
)

const { result: newGroupResult } = useSubscription(
  gql`
    subscription {
      groupCreated
    }
  `
)

const { result: newAgentResult } = useSubscription(
  gql`
    subscription {
      agentCreated {
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
      groups.value = [...result.data.groups]
    }
  })

  onAgentsResult((result) => {
    if (result.data) {
      agents.value = [...result.data.agents]
    }
  })

  if (newGroupResult.value) {
    console.log('groupCreated subscription data:', newGroupResult.value)
    groups.value.push({ name: newGroupResult.value.groupCreated })
    newGroupResult.value = null
  }

  if (newAgentResult.value?.agentCreated) {
    console.log(
      'agentCreated subscription data:',
      newAgentResult.value.agentCreated
    )
    const existingAgentIndex = agents.value.findIndex(
      (agent) => agent.name === newAgentResult.value.agentCreated.name
    )
    if (existingAgentIndex !== -1) {
      agents.value[existingAgentIndex] = newAgentResult.value.agentCreated
    } else {
      agents.value = [...agents.value, newAgentResult.value.agentCreated]
    }
  }
})

async function addGroup() {
  // Replace 'NewGroup' with the actual group name
  await addGroupMutation({ name: 'NewGroup' })
}

async function addAgent() {
  // Replace 'NewAgent' and 'NewDriver' with the actual agent name and driver
  await addAgentMutation({ name: 'Head of Operations', driver: 'openai' })
}
</script>

<style lang="stylus"></style>