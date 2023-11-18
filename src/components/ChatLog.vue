<template lang="pug">
div
  h2 History
  ul(v-if="messages.length")
    li(v-for="message in messages" :key="message.id") {{ message.content }}
</template>

<script setup>
import { useQuery } from "@vue/apollo-composable";
import { gql } from "@apollo/client/core";
import { ref, watchEffect } from "vue";

// eslint-disable-next-line no-unused-vars
const { result: messagesResult, onResult: onMessagesResult } = useQuery(
  gql`
    query {
      messages {
        id
        content
      }
    }
  `
);

const messages = ref([]);

watchEffect(() => {
  onMessagesResult((result) => {
    if (result.data) {
      messages.value = result.data.messages;
    }
  });
});
</script>

<style lang="stylus">
// Add your stylus styles here
</style>