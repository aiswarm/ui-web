<template lang="pug">
v-card
  h3 Groups
  v-list(v-if="groups.length" selected=selected )
    v-list-item(v-for="group in groups" :key="group.name" @click="selectChat(group.name, 'group')" :class="{ 'selected-chat': group.name === targetSelected.name, badge: true }")
      v-badge(v-if="group.count > 0" :content="group.count" floating=true offset-y="5" offset-x="-5" label="{{group.name}}" color="#f0f0f0" ) {{ group.name }}
      span(v-else) {{ group.name }}
    v-list-item
      v-btn(icon="mdi-plus" @click="showAddGroupDialog = true" density="compact")
      v-dialog(v-model="showAddGroupDialog", max-width="290")
        v-card
          v-card-title
            span.headline Add Group
          v-card-text
            v-text-field(v-model="newGroupName" label="Group Name" autofocus="true")
          v-card-actions
            v-spacer
            v-btn(text @click="showAddGroupDialog = false") Cancel
            v-btn(color="blue darken-1" text @click="addGroup") Add
  h3 Agents
  v-list(v-if="agents.length")
    v-list-item(v-for="agent in agents" :key="agent.name" @click="selectChat(agent.name, 'agent')" :class="{ 'selected-chat': agent.name === targetSelected.name, badge: true }")
      v-badge(v-if="agent.count > 0" :content="agent.count" floating=true offset-y="5" offset-x="-5" label="{{agent.name}}" color="#f0f0f0") {{ agent.name }}
      span(v-else) {{ agent.name }}
    v-list-item
      v-btn(icon="mdi-plus" @click="showAddAgentDialog = true" density="compact" )
      v-dialog(v-model="showAddAgentDialog" max-width="290")
        v-card
          v-card-title
            span.headline Add Agent
          v-card-text
            v-text-field(v-model="newAgentName" label="Agent Name" autofocus="true")
            v-select(v-model="selectedDriver" :items="drivers" label="Driver")
          v-card-actions
            v-spacer
            v-btn(text @click="showAddAgentDialog = false") Cancel
            v-btn(color="blue darken-1" text @click="addAgent") Add
</template>

<script setup>
import { inject, ref, watch } from 'vue'
import { useMutation, useQuery, useSubscription } from '@vue/apollo-composable'
import { gql } from '@apollo/client/core'

const targetSelected = inject('targetSelected')

const defaultGroup = { name: 'All', type: 'group' }
const groups = ref([defaultGroup])
const agents = inject('agents')
const drivers = inject('drivers')
const selected = ref([])
// Fetch initial data on load

useQuery(
  gql`
    query {
      groups {
        name
        members
      }
      agents {
        name
      }
      drivers {
        type
      }
    }
  `
).onResult((result) => {
  if (result.loading || result.error) return
  groups.value = [defaultGroup]
  result.data.groups.forEach((group) => {
    groups.value.push({
      ...group,
      count: 0,
      lastSeen: 0,
    })
  })
  agents.value = []
  result.data.agents.forEach((agent) => {
    agents.value.push({
      ...agent,
      count: 0,
      lastSeen: 0,
    })
  })
  drivers.value = []
  result.data.drivers.forEach((driver) => {
    drivers.value.push(driver.type)
  })
  // Remove duplicates
  drivers.value = drivers.value.sort().filter((item, index, array) => {
    return index === 0 || item !== array[index - 1]
  })
})

// React to groups being created

useSubscription(
  gql`
    subscription {
      groupCreated {
        name
        members
      }
    }
  `
).onResult((result) => {
  if (result.data?.groupCreated) {
    const newGroup = result.data.groupCreated
    if (!groups.value.find((group) => group.name === newGroup.name)) {
      groups.value.push({
        ...newGroup,
        count: 0,
        lastSeen: 0,
      })
    }
  }
})

// React to agents being created

useSubscription(
  gql`
    subscription {
      agentCreated {
        name
      }
    }
  `
).onResult((result) => {
  if (result.data?.agentCreated) {
    const newAgent = result.data.agentCreated
    if (!agents.value.find((agent) => agent.name === newAgent.name)) {
      agents.value.push({
        ...newAgent,
        count: 0,
        lastSeen: 0,
      })
    }
  }
})

// React to messages being created
const messages = inject('messages')

watch(messages.value, (messages) => {
  messages.forEach((message) => {
    const target = message.target
    const agent =
      agents.value.find((agent) => agent.name === target) ??
      groups.value.find((group) => group.name === target)
    if (!agent) {
      console.log(`No agent or group found for target: ${target}`)
      return
    }
    const current = targetSelected.value.name
    const messageTime = new Date(message.timestamp).getTime()
    if (target !== current && messageTime > agent.lastSeen) {
      agent.count++
    }
    agent.lastSeen = Math.max(messageTime, agent.lastSeen)
  })
})

// Actions in this component

const selectChat = (name, type) => {
  targetSelected.value = { name, type }
  selected.value = [name]
  const agent =
    agents.value.find((agent) => agent.name === name) ??
    groups.value.find((group) => group.name === name)
  if (agent) {
    agent.count = 0
  }
}

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
    showAddGroupDialog.value = false
    newGroupName.value = ''
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
    })
    showAddAgentDialog.value = false
    newAgentName.value = ''
    selectedDriver.value = ''
  }
}
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