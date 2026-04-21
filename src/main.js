import { createApp, reactive } from 'vue'
import { ApolloClient, HttpLink, InMemoryCache, split } from '@apollo/client'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { createClient } from 'graphql-ws'
import { OperationTypeNode } from 'graphql'
import { DefaultApolloClient } from '@vue/apollo-composable'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import App from './App.vue'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

// Create an http link:
const httpLink = new HttpLink({
  uri: 'http://localhost:4000/graphql'
})

// Create a WebSocket link
const wsLink = new GraphQLWsLink(
  createClient({
    url: 'ws://localhost:4000/graphql',
    retryAttempts: Infinity,
    on: {
      error: error => {
        console.error('WebSocket connection error:', error)
      }
    }
  })
)

/*
 * using the ability to split links, you can send data to each link
 * depending on what kind of operation is being sent
 */
const splitLink = split(
  ({ operationType }) => operationType === OperationTypeNode.SUBSCRIPTION,
  wsLink,
  httpLink
)

const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache()
})

const preferences = reactive({
  scrollOnMessage: true
})

const app = createApp(App)
app.provide(DefaultApolloClient, apolloClient)
app.provide('preferences', preferences)
app.provide('app', app)
app.use(
  createVuetify({
    components,
    directives
  })
)
app.mount('#app')
