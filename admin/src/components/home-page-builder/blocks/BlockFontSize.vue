<template>
  <q-card flat bordered>
    <q-card-section>
      <p class="text-bold q-ma-none">Size</p>
    </q-card-section>
    <q-separator/>
    <div class="q-pa-sm">
      <q-input outlined stack-label type="number" label="Size" :model-value="modelValue" @update:model-value="onChange"/>
    </div>
  </q-card>
</template>

<script setup>
defineProps({
  modelValue: {
    type: String
  }
})

const emit = defineEmits(['update:modelValue'])
const onChange = (e) => emit('update:modelValue', e)
</script>

<style scoped>

</style>
