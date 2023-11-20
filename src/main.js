import {createApp, reactive} from 'vue'
import {createRouter, createWebHistory} from 'vue-router'
import {ApolloClient, HttpLink, InMemoryCache, split} from '@apollo/client'
import {getMainDefinition} from '@apollo/client/utilities'
import {WebSocketLink} from '@apollo/link-ws'
import {DefaultApolloClient} from '@vue/apollo-composable'
import App from './App.vue'
import SideBar from './components/SideBar.vue'
import ChatLog from './components/ChatLog.vue'
import ChatBar from './components/ChatBar.vue'
import {createVuetify} from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'vuetify/dist/vuetify.min.css'
import '@mdi/font/css/materialdesignicons.css'

// Create an http link:
const httpLink = new HttpLink({
  uri: 'http://localhost:4000/graphql',
})

// Create a WebSocket link:
const wsLink = new WebSocketLink({
  uri: 'ws://localhost:4000/graphql',
  options: {
    reconnect: true,
    connectionCallback: (error) => {
      if (error) {
        console.error(`WebSocket connection error: ${error}`)
      }
    },
  },
})

// using the ability to split links, you can send data to each link
// depending on what kind of operation is being sent
const splitLink = split(
  // split based on operation type
  ({ query }) => {
    const definition = getMainDefinition(query)
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    )
  },
  wsLink,
  httpLink
)

const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
})

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: SideBar },
    { path: '/chatlog', component: ChatLog },
    { path: '/chatbar', component: ChatBar },
  ],
})

const preferences = reactive({
  scrollOnMessage: true,
})

const app = createApp(App)
app.provide(DefaultApolloClient, apolloClient)
app.provide('preferences', preferences)
app.use(router)
app.use(
  createVuetify({
    components,
    directives,
  })
)
app.mount('#app')
