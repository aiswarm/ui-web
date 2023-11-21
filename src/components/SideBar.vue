<template lang="pug">
div
    h2 Groups
    ul(v-if="groups.length")
        li(v-for="group in groups" :key="group.name") {{ group.name }}
    v-btn(icon="mdi-plus" @click="showAddGroupDialog = true" density="compact" )
    v-dialog(v-model="showAddGroupDialog", max-width="290")
        v-card
            v-card-title
                span.headline Add Group
            v-card-text
                v-text-field(v-model="newGroupName" label="Group Name" @keydown.enter="addGroup" @keydown.esc="showAddGroupDialog = false")
            v-card-actions
                v-spacer
                v-btn(text @click="showAddGroupDialog = false") Cancel
                v-btn(color="blue darken-1", text @click="addGroup") Add
    h2 Agents
    ul(v-if="agents.length")
        li(v-for="agent in agents" :key="agent.name") {{ agent.name }}
    v-btn(icon="mdi-plus" @click="showAddAgentDialog = true" density="compact" )
    v-dialog(v-model="showAddAgentDialog" max-width="290")
        v-card
            v-card-title
                span.headline Add Agent
            v-card-text
                v-text-field(v-model="newAgentName" label="Agent Name" @keydown.enter="addAgent" @keydown.esc="showAddAgentDialog = false")
                v-select(v-model="selectedDriver" :items="drivers.map(driver => driver.type)" label="Driver" @keydown.enter="addAgent" @keydown.esc="showAddAgentDialog = false")
            v-card-actions
                v-spacer
                v-btn(text @click="showAddAgentDialog = false") Cancel
                v-btn(color="blue darken-1" text @click="addAgent") Add
</template>

<script setup>
import { useMutation, useQuery, useSubscription } from '@vue/apollo-composable'
import { gql } from '@apollo/client/core'
import { ref, watchEffect } from 'vue'

const groups = ref([])
const agents = ref([])
const drivers = ref([])

const { result: dataResult } = useQuery(
  gql`
    query {
      groups {
        name
      }
      agents {
        name
      }
      drivers {
        type
      }
    }
  `
)

const { onResult: onGroupCreated } = useSubscription(
  gql`
    subscription {
      groupCreated
    }
  `
)

const { onResult: onAgentCreated } = useSubscription(
  gql`
    subscription {
      agentCreated {
        name
      }
    }
  `
)

watchEffect(() => {
  if (dataResult.value) {
    if (dataResult.value.groups) {
      groups.value = [...dataResult.value.groups]
    }

    if (dataResult.value.agents) {
      agents.value = [...dataResult.value.agents]
    }

    if (dataResult.value.drivers) {
      drivers.value = [...dataResult.value.drivers]
    }
  }

  onGroupCreated((result) => {
    if (result.data) {
      groups.value.push({ name: result.data.groupCreated })
      delete result.data
    }
  })

  onAgentCreated((result) => {
    if (result.data) {
      agents.value.push(result.data.agentCreated)
      delete result.data
    }
  })
})

// Groups

const { mutate: addGroupMutation } = useMutation(
  gql`
    mutation CreateGroup($name: String!) {
      createGroup(name: $name)
    }
  `
)

const showAddGroupDialog = ref(false)
const newGroupName = ref('')

async function addGroup() {
  if (newGroupName.value.trim() !== '') {
    await addGroupMutation({ name: newGroupName.value })
    newGroupName.value = ''
    showAddGroupDialog.value = false
  }
}

// Agents

const { mutate: addAgentMutation } = useMutation(
  gql`
    mutation CreateAgent($name: String!, $driver: String!) {
      createAgent(name: $name, driver: $driver) {
        name
      }
    }
  `
)

const showAddAgentDialog = ref(false)
const newAgentName = ref('')
const selectedDriver = ref('')

async function addAgent() {
  if (newAgentName.value.trim() !== '' && selectedDriver.value) {
    await addAgentMutation({
      name: newAgentName.value,
      driver: selectedDriver.value,
    })
    newAgentName.value = ''
    selectedDriver.value = ''
    showAddAgentDialog.value = false
  }
}
</script>

<style lang="stylus"></style>