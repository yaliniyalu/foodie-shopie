<template>
  <q-badge :color="ratingColor(value)">
    {{value}} <q-icon name="star" v-if="star"/>
  </q-badge>
</template>

<script setup>
defineProps({
  value: {
    type: [Number, String],
    required: true
  },
  star: {
    type: Boolean,
    default: false
  }
})

function ratingColor(rating) {
  if (rating >= 4) {
    return 'green';
  } else if (rating >= 3) {
    return 'orange';
  } else if (rating >= 1) {
    return 'red'
  } else {
    return 'grey'
  }
}
</script>

<style lang="scss" scoped>

</style>
