<template>
  <template v-if="model && !error">
    <slot/>
  </template>

  <template v-if="error && !loading">
    <q-banner class="bg-negative text-white">{{ errorMessage }}</q-banner>
  </template>

  <div v-if="loading">
    <q-inner-loading showing>
      <q-spinner-bars size="50px" color="secondary"/>
    </q-inner-loading>
  </div>
</template>

<script setup>
const props = defineProps({
  model: {
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: Boolean,
    default: false
  },
  errorMessage: {
    type: String,
    default: "Unexpected error occurred"
  }
})
</script>

<style lang="scss" scoped>

</style>
