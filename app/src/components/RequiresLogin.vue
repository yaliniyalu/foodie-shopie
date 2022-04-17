<template>
  <NavBar back search/>
  <q-page>

  </q-page>
</template>

<script setup>
import {computed} from "vue";
import NavBar from "components/NavBar";

const props = defineProps({
  next: {
    type: String,
    default: null
  }
})

/** @type ComputedRef<IUser> */
const user = computed(() => store.state.app.user)

</script>

<style lang="scss" scoped>

</style>
