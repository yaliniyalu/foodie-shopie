<template>
  <q-badge :label="rating + ' ★'" :color="color"/>
</template>

<script setup>
import {computed, ref} from "vue";

const props = defineProps({
  rating: {
    type: [Number, String],
    required: true
  }
})

const rating = computed(() => parseFloat(props.rating).toFixed(1))
const color = computed(() => {
  if (props.rating >= 3) {
    return 'positive'
  } else if (rating >= 2) {
    return 'warning'
  } else {
    return 'negative'
  }
})
</script>

<style lang="scss" scoped>

</style>
