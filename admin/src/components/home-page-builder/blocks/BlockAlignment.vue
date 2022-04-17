<template>
  <q-card flat bordered>
    <q-card-section>
      <p class="text-bold q-ma-none">Alignment</p>
    </q-card-section>
    <q-separator/>
    <div class="flex column">
      <q-radio v-model="modelValue" :val="opt.value" :label="opt.label" v-for="opt in TextAlignOpts" @update:model-value="onChange"/>
    </div>
  </q-card>
</template>

<script setup>
import {TextAlignOpts} from "src/js/hp-builder";

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
