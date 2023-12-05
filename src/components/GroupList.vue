<template lang="pug">
h3 Groups
v-list(v-if="groups.length")
  v-list-item(v-for="group in groups" :key="group.name" @click="selectGroup(group.name)" :class="{ 'selected-chat': group.name === targetSelected.name, badge: true }")
    v-badge(v-if="group.count > 0" :content="group.count" floating=true offset-y="5" offset-x="-5" label="{{group.name}}" color="#f0f0f0" ) {{ group.name }}
    span(v-else) {{ group.name }}
  v-list-item
    v-btn(icon="mdi-plus" @click="showAddGroupDialog = true" density="compact")
    v-dialog(v-model="showAddGroupDialog", max-width="290")
      v-card
        v-card-title
          span.headline Add Group
        v-card-text
          v-text-field(v-model="newGroupName" label="Group Name" autofocus=true)
        v-card-actions
          v-spacer
          v-btn(text @click="showAddGroupDialog = false") Cancel
          v-btn(color="blue darken-1" text @click="addGroup") Add
</template>

<script setup>
import {inject, ref, watch} from 'vue'
import {useMutation} from '@vue/apollo-composable'
import {gql} from '@apollo/client/core'

const targetSelected = inject('targetSelected')
const groups = inject('groups')
const message = inject('message')

watch(message,
  (message) => {
    const group = groups.value.find((group) => group.name === message.target)
    if (!group) {
      return
    }
    if (targetSelected.value.name !== message.target) {
      group.count++
    }
  })

/**
 *  Select a group and resets the count of unread messages.
 * @param {string} name
 */
const selectGroup = (name) => {
  targetSelected.value = {name, type: 'group'}
  const group = groups.value.find((group) => group.name === name)
  if (group) {
    group.count = 0
  }
}

const {mutate: addGroupMutation} = useMutation(
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
    await addGroupMutation({name: newGroupName.value})
    showAddGroupDialog.value = false
    newGroupName.value = ''
  }
}
</script>

<style lang="stylus"></style>