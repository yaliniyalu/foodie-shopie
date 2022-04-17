<template>
  <q-card flat bordered>
    <q-card-section>
      <p class="text-bold q-ma-none">Color</p>
    </q-card-section>
    <q-separator/>
    <div class="flex column">
      <div>
        <q-radio v-model="colorType" val="predefined" label="Predefined"/>
        <q-radio v-model="colorType" val="custom" label="Custom"/>
      </div>
      <q-separator/>
      <div v-if="colorType === 'predefined'">
        <q-radio :model-value="modelValue" :val="opt.value" :label="opt.label" :color="opt.value" v-for="opt in ColorOpts" @update:model-value="onChange"/>
      </div>
      <div class="q-pa-sm" v-else>
        <q-input outlined stack-label label="Color" :model-value="modelValue" @update:model-value="onChange">
          <template v-slot:append>
            <q-icon name="colorize" class="cursor-pointer">
              <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                <q-color :model-value="modelValue" default-view="palette" format-model="hex" @update:model-value="onChange"/>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>
    </div>
  </q-card>
</template>

<script setup>
import {ColorOpts} from "src/js/hp-builder";
import {ref, watch} from "vue";

const props = defineProps({
  modelValue: {
    type: String
  }
})

const emit = defineEmits(['update:modelValue'])

const colorType = ref(props.modelValue ? props.modelValue.startsWith('#') ? 'custom' : 'predefined' : null)

watch(colorType, v => emit('update:modelValue', (v === 'predefined' ? 'primary' : '#cecece')))

const onChange = (e) => emit('update:modelValue', e)
</script>

<style scoped>

</style>
