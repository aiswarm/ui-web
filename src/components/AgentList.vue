<template lang="pug">
h3 Agents
v-list(v-if="agents.length")
  v-list-item(v-for="agent in agents" :key="agent.name" @click="selectAgent(agent.name)" :class="{ 'selected-chat': agent.name === targetSelected.name, badge: true }")
    v-list-item-content(style="display: flex; align-items: center;")
      span(v-if="agent.name === targetSelected.name" class="selected-chat") {{ agent.name }}
      span(v-else) {{ agent.name }}
      v-icon(v-if="agent.status === 'idle'" :title="agent.status") mdi-check
      v-icon.mdi-spin(v-if="agent.status === 'busy'" :title="agent.status") mdi-loading
      v-icon(v-if="agent.status === 'error'" :title="agent.status") mdi-close
  v-list-item
    v-btn(icon="mdi-plus" @click="showAddAgentDialog = true" density="compact" )
    v-dialog(v-model="showAddAgentDialog" max-width="490")
      v-card
        v-card-title
          span.headline Add Agent
        v-card-text
          v-text-field(v-model="newAgentName" label="Agent Name" autofocus=true)
          v-select(v-model="selectedDriver" :items="drivers" label="Driver")
          v-text-field(v-model="newAgentDescription" label="description (optional)")
          v-textarea(v-model="newAgentInstructions" label="Starting Instructions (optional)")
          v-select(v-model="selectedSkills" :items="skills" label="Skills" multiple=true )
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
const skills = inject('skills')

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
    mutation CreateAgent($name: String!, $driver: String!, $description: String, $instructions: String, $skills: [String] ) {
      createAgent(name: $name, driver: $driver, description: $description, instructions: $instructions, skills: $skills) {
        name
      }
    }
  `
)

const showAddAgentDialog = ref(false)
const newAgentName = ref('')
const newAgentDescription = ref('')
const newAgentInstructions = ref('')
const selectedDriver = ref('')
const selectedSkills = ref([])

watch(showAddAgentDialog, (newValue) => {
  if (newValue && drivers.value.length === 1) {
    selectedDriver.value = drivers.value[0]
  }
})

async function addAgent() {
  if (newAgentName.value.trim() !== '' && selectedDriver.value) {
    await addAgentMutation({
      name: newAgentName.value,
      driver: selectedDriver.value,
      description: newAgentDescription.value,
      instructions: newAgentInstructions.value,
      skills: selectedSkills.value
    })
    showAddAgentDialog.value = false
    newAgentName.value = ''
    selectedDriver.value = ''
    newAgentDescription.value = ''
    newAgentInstructions.value = ''
    selectedSkills.value = []
  }
}
</script><style lang="stylus"></style>
