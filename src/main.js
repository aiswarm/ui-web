import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import { ApolloClient, InMemoryCache } from "@apollo/client";
import { DefaultApolloClient } from "@vue/apollo-composable";
import App from "./App.vue";
import SideBar from "./components/SideBar.vue";
import ChatLog from "./components/ChatLog.vue";
import ChatBar from "./components/ChatBar.vue";

const apolloClient = new ApolloClient({
  uri: "http://localhost:4000/graphql",
  cache: new InMemoryCache(),
});

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: SideBar },
    { path: "/chatlog", component: ChatLog },
    { path: "/chatbar", component: ChatBar },
  ],
});

const app = createApp(App);
app.provide(DefaultApolloClient, apolloClient);
app.use(router);
app.mount("#app");
