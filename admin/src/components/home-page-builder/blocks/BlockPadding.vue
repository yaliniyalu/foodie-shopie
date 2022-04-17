<template>
  <q-card flat bordered>
    <q-card-section>
      <p class="text-bold q-ma-none">Padding</p>
    </q-card-section>
    <q-separator/>
    <div class="row text-center">
      <template v-for="(side, i) in sides">
        <div class="col">
          <div class="text-bold">{{ side }}</div>
          <div class="flex column">
            <q-radio :model-value="modelValue[i]" :val="opt" :label="opt" v-for="opt in PaddingOpts" @update:model-value="v => model[i] = v"/>
          </div>
        </div>
        <q-separator vertical/>
      </template>
    </div>
  </q-card>
</template>

<script setup>
import {watch} from "vue";

const props = defineProps({
  modelValue: {
    type: Array
  }
})

const emit = defineEmits(['update:modelValue'])
const model = props.modelValue

const sides = ['Left', 'Right', 'Top', 'Bottom']
const PaddingOpts = ['xs', 'sm', 'md', 'lg', 'xl', 'none']

watch(model, () => emit('update:modelValue', model))
</script>

<style scoped>

</style>
