<template lang="pug">
div
  input(type="text" v-model="message")
  button(@click="sendMessage") Send
</template>

<script setup>
import { useMutation } from "@vue/apollo-composable";
import { gql } from "@apollo/client/core";
import { ref } from "vue";

const { mutate: sendMessageMutation } = useMutation(
  gql`
    mutation SendMessage($message: String!) {
      sendMessage(message: $message) {
        id
        content
      }
    }
  `
);
const message = ref("");

// eslint-disable-next-line no-unused-vars
async function sendMessage() {
  if (typeof message.value === "string" && message.value.trim() !== "") {
    await sendMessageMutation({ message: message.value });
    message.value = "";
  }
}
</script>

<style lang="stylus">
// Add your stylus styles here
</style>