<template lang="pug">
div
  h2 History
  ul(v-if="messages.length")
    li(v-for="message in messages" :key="message.id") {{ message.content }}
</template>

<script setup>
import { useQuery, useSubscription } from "@vue/apollo-composable";
import { gql } from "@apollo/client/core";
import { ref, watchEffect } from "vue";

// Query for getting the initial messages
const { result: messagesResult } = useQuery(
  gql`
    query {
      messages {
        id
        content
      }
    }
  `
);

// Subscription for getting new messages
const { result: newMessageResult } = useSubscription(
  gql`
    subscription {
      messageSent {
        id
        content
      }
    }
  `
);

const messages = ref([]);

watchEffect(() => {
  // Update messages with the initial data
  if (messagesResult.value?.messages) {
    messagesResult.value.messages.forEach((message) => {
      if (!messages.value.find((m) => m.id === message.id)) {
        messages.value.push(message);
      }
    });
  }

  // Update messages with the new message
  if (newMessageResult.value?.messageSent) {
    if (
      !messages.value.find(
        (m) => m.id === newMessageResult.value.messageSent.id
      )
    ) {
      messages.value.push(newMessageResult.value.messageSent);
    }
  }
});
</script>

<style lang="stylus">
// Add your stylus styles here
</style>