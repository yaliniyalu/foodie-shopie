<template>
  <q-badge :color="badge.color" :label="badge.label" v-if="badge"/>
</template>

<script setup>
import {computed} from "vue";

const props = defineProps({
  options: {
    type: Array,
    required: true
  },
  value: {
    type: [String, Number, Boolean],
    default: null
  }
})

const badge = computed(() => props.options.find(s => s.value === props.value))
</script>

<style lang="scss" scoped>

</style>
