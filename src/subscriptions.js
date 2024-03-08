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
 * @type {Ref<String[]>}
 */
export const drivers = ref([])

/**
 * A list of all messages that have been sent from the server so far.
 * @type {Ref<Message[]>}
 */
export const messages = ref([])

/**
 * A list of all skills that are available to newly created agents.
 * @type {Ref<String[]>}
 */
export const skills = ref([])

function errorHandler(error) {
  if (error.name === 'ApolloError') {
    if (error.networkError?.originalError) {
      console.error(error.networkError.originalError.name, error.networkError.originalError.originalError)
    }
    if (error.graphQLErrors.length) {
      const messages = error.graphQLErrors.map((error) => error.message)
      console.error('GraphQL Errors: ', messages)
    }
    if (error.protocolErrors.length) {
      const messages = error.protocolErrors.map((error) => error.message)
      console.error('Protocol Errors: ', messages)
    }
    if(error.clientErrors.length) {
      const messages = error.clientErrors.map((error) => error.message)
      console.error('Client Errors: ', messages)
    }
  } else {
    console.error(error)
  }
}

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
          status
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
          status
        }
        skills {
          name        
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

    skills.value = []
    result.data.skills.forEach((skill) => {
      skills.value.push(skill.name)
    })
    skills.value.sort()

    for (const message of result.data.history) {
      messages.value.push(message)
    }
  })
  onError(errorHandler)
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
  onError(errorHandler)
}

/**
 * The last agent that has been created.
 * @type {Ref<Agent>}
 */
export const agent = ref(null)

export function subscribeToAgents() {
  const {onResult, onError} = useSubscription(
    gql`
      subscription {
        agentCreated {
          name
          status
        }
      }
    `)
  onResult((result) => {
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
  onError(errorHandler)

  const {onResult: onUpdateResult, onError: onUpdateError} = useSubscription(
    gql`
      subscription {
        agentUpdated {
          name
          status
        }
      }
    `)

  onUpdateResult((result) => {
    if (result.data?.agentUpdated) {
      const updatedAgent = result.data.agentUpdated
      const index = agents.value.findIndex((agent) => agent.name === updatedAgent.name)
      if (index >= 0) {
        agents.value[index] = updatedAgent
      }
    }
  })

  onUpdateError(errorHandler)
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
          status
        }
      }
    `
  )

  onError(errorHandler)

  onResult((result) => {
    if (newMessageResult.value?.messageCreated) {
      messages.value.push(result.data.messageCreated)
      message.value = result.data.messageCreated
    }
  })

  const {result: updatedMessageResult, onError: onUpdateError, onResult: onUpdateResult} = useSubscription(
    gql`
      subscription {
        messageUpdated {
          id
          timestamp
          source
          target
          content
          type
          status
        }
      }
    `
  )

  onUpdateError(errorHandler)

  onUpdateResult((result) => {
    if (updatedMessageResult.value?.messageUpdated) {
      const updatedMessage = result.data.messageUpdated
      const index = messages.value.findIndex((message) => message.id === updatedMessage.id)
      if (index >= 0) {
        messages.value[index] = updatedMessage
      }
    }
  })
}

/**
 * A helper class that emits events when a skill is changing status based on backend events.
 * @type {{listeners: {}, emit: skillEvents.emit, on: skillEvents.on}}
 */
export const skillEvents = {
  listeners: {},
  on: function(event, callback){
    if (this.listeners[event]) {
      this.listeners[event].push(callback)
    } else {
      this.listeners[event] = [callback]
    }
  },
  emit: function(event, ...data)  {
    if (this.listeners[event]) {
      for (const listener of this.listeners[event]) {
        listener(...data)
      }
    }
  }
}

export function subscribeToSkills() {
  const {result: skillStatusResult, onError, onResult} = useSubscription(
    gql`
      subscription {
        skillStatus {
          status
          agent
          skill
          data
        }
      }
    `)

  onError(errorHandler)

  onResult((result) => {
    if (skillStatusResult.value?.skillStatus) {
      const skillStatus = result.data.skillStatus
      console.debug('Skill Status:', skillStatus)
      skillEvents.emit(skillStatus.status, skillStatus.agent, skillStatus.skill, skillStatus.data)
    }
  })
}