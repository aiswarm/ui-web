<template lang="pug">
h3 Agents
v-list(v-if="agents.length")
  v-list-item(v-for="agent in agents" :key="agent.name" @click="selectAgent(agent.name)" :class="{ 'selected-chat': agent.name === targetSelected.name, badge: true }")
    v-badge(v-if="agent.count > 0" :content="agent.count" floating=true offset-y="5" offset-x="-5" label="{{agent.name}}" color="#f0f0f0") {{ agent.name }} ({{ agent.status }})
    span(v-else) {{ agent.name }} ({{ agent.status }})
  v-list-item
    v-btn(icon="mdi-plus" @click="showAddAgentDialog = true" density="compact" )
    v-dialog(v-model="showAddAgentDialog" max-width="290")
      v-card
        v-card-title
          span.headline Add Agent
        v-card-text
          v-text-field(v-model="newAgentName" label="Agent Name" autofocus=true)
          v-select(v-model="selectedDriver" :items="drivers" label="Driver")
        v-card-actions
          v-spacer
          v-btn(text @click="showAddAgentDialog = false") Cancel
          v-btn(color="blue darken-1" text @click="addAgent") Add
</template>

<script setup>
import {inject, ref, watch} from 'vue'
import {useMutation} from '@vue/apollo-composable'
import {gql} from '@apollo/client/core'

const targetSelected = inject('targetSelected')
const agents = inject('agents')
const drivers = inject('drivers')
const message = inject('message')

watch(message, (message) => {
  const agent = agents.value.find((agent) => agent.name === message.target)
  if (!agent) {
    return
  }
  if (targetSelected.value.name !== message.target) {
    agent.count++
  }
})


const selectAgent = (name) => {
  targetSelected.value = {name, type: 'agent'}
  const agent = agents.value.find((agent) => agent.name === name)
  if (agent) {
    agent.count = 0
  }
}

const {mutate: addAgentMutation} = useMutation(
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

watch(showAddAgentDialog, (newValue) => {
  if (newValue && drivers.value.length === 1) {
    selectedDriver.value = drivers.value[0]
  }
})

async function addAgent() {
  if (newAgentName.value.trim() !== '' && selectedDriver.value) {
    await addAgentMutation({
      name: newAgentName.value,
      driver: selectedDriver.value
    })
    showAddAgentDialog.value = false
    newAgentName.value = ''
    selectedDriver.value = ''
  }
}
</script>

<style lang="stylus"></style>
