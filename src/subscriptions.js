import {ref} from 'vue'
import {useQuery, useSubscription} from '@vue/apollo-composable'
import {gql} from '@apollo/client/core'

export const defaultGroup = 'All'
/**
 *  A list of all agents that have been created so far.
 * @type {Ref<Agent[]>}
 */
export const agents = ref([])

/**
 *  A list of all groups that have been created so far.
 * @type {Ref<Group[]>}
 */
export const groups = ref([{name: defaultGroup, members: []}])

/**
 * A list of all drivers that have been created so far.
 * @type {Ref<Driver[]>}
 */
export const drivers = ref([])

/**
 * A list of all messages that have been sent from the server so far.
 * @type {Ref<Message[]>}
 */
export const messages = ref([])

export async function loadCurrentState() {
  const {onResult, onError} = useQuery(
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
        history {
          id
          timestamp
          source
          target
          content
          type
        }
      }
    `
  )
  onResult((result) => {
    if (result.loading || result.error) {
      return
    }
    groups.value = [{name: defaultGroup, members: []}]
    result.data.groups.forEach((group) => {
      groups.value.push({
        ...group,
        members: group.members.toSorted(),
        count: 0
      })
    })
    agents.value = []
    result.data.agents.forEach((agent) => {
      agents.value.push({
        ...agent,
        count: 0
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

    for (const message of result.data.history) {
      messages.value.push(message)
    }
  })
  onError((error) => {
    console.error(error)
  })
}

/**
 * The last group that has been created.
 * @type {Ref<Group>}
 */
export const group = ref(null)

export function subscribeToGroups() {
  const {onResult, onError} = useSubscription(
    gql`
      subscription {
        groupCreated {
          name
          members
        }
      }
    `
  )
  onResult((result) => {
    if (result.data?.groupCreated) {
      const newGroup = result.data.groupCreated
      if (!groups.value.find((group) => group.name === newGroup.name)) {
        const clientGroup = {
          ...newGroup,
          members: newGroup.members.toSorted(),
          count: 0
        }
        groups.value.push(clientGroup)
        group.value = clientGroup
      }
    }
  })
  onError((error) => {
    console.error(error)
  })
}

/**
 * The last agent that has been created.
 * @type {Ref<Agent>}
 */
export const agent = ref(null)

export function subscribeToAgents() {
  const response = useSubscription(
    gql`
      subscription {
        agentCreated {
          name
        }
      }
    `
  )
  response.onResult((result) => {
    if (result.data?.agentCreated) {
      const newAgent = result.data.agentCreated
      if (!agents.value.find((agent) => agent.name === newAgent.name)) {
        const clientAgent = {
          ...newAgent,
          count: 0
        }
        agents.value.push(clientAgent)
        agent.value = clientAgent
      }
    }
  })
  response.onError((error) => {
    console.error(error)
  })
}

/**
 * The last message that has been sent from the server.
 * @type {Ref<Message>}
 */
export const message = ref(null)

export function subscribeToMessages() {
  const {result: newMessageResult, onError, onResult} = useSubscription(
    gql`
      subscription {
        messageCreated {
          id
          timestamp
          source
          target
          content
          type
        }
      }
    `
  )

  onError((error) => {
    console.error(error)
  })

  onResult((result) => {
    if (newMessageResult.value?.messageCreated) {
      messages.value.push(result.data.messageCreated)
      message.value = result.data.messageCreated
    }
  })
}