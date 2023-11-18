<template lang="pug">
div
  Sidebar
  div
    ChatLog
    ChatBar
</template>

<script>
import Sidebar from "./components/SideBar.vue";
import ChatLog from "./components/ChatLog.vue";
import ChatBar from "./components/ChatBar.vue";

export default {
  components: {
    Sidebar,
    ChatLog,
    ChatBar,
  },
};
</script>

<style lang="stylus"></style>