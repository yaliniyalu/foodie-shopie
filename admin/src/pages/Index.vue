<template>
  <Dashboard/>
</template>

<script>
import { defineComponent } from 'vue';
import Dashboard from "pages/dashboard/Dashboard";

export default defineComponent({
  name: 'PageIndex',
  components: {Dashboard}
})
</script>
