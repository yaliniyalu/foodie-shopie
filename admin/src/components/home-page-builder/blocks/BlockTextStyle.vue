<template>
  <q-card flat bordered>
    <q-card-section>
      <p class="text-bold q-ma-none">Style</p>
    </q-card-section>
    <q-separator/>
    <div class="flex column">
      <q-checkbox :model-value="modelValue" :val="opt.value" :label="opt.label" v-for="opt in TextStyleOpts" @update:model-value="onChange"/>
    </div>
  </q-card>
</template>

<script setup>
import {TextStyleOpts} from "src/js/hp-builder";

defineProps({
  modelValue: {
    type: Array
  }
})

const emit = defineEmits(['update:modelValue'])
const onChange = (e) => emit('update:modelValue', e)
</script>

<style scoped>

</style>
