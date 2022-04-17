<template>
<div class="q-gutter-md q-pa-md">
  <div class="row">
    <q-card flat bordered class="col">
      <q-card-section>
        <p class="text-bold q-ma-none">Style</p>
      </q-card-section>
      <q-separator/>
      <div class="flex column">
        <q-radio v-model="model.style" :val="opt.value" :label="opt.label" v-for="opt in styleOpts"/>
        <q-separator/>
        <q-checkbox v-model="model.overlay" label="Overlay"/>
      </div>
    </q-card>

    <q-card flat bordered class="col">
      <q-card-section>
        <p class="text-bold q-ma-none">Position</p>
      </q-card-section>
      <q-separator/>
      <div class="flex column">
        <q-radio v-model="model.position" :val="opt.value" :label="opt.label" v-for="opt in positionOpts"/>
      </div>
    </q-card>

    <BlockAlignment v-model="model.align" class="col"/>

    <q-card flat bordered class="col">
      <q-card-section>
        <p class="text-bold q-ma-none">Default Content</p>
      </q-card-section>
      <q-separator/>
      <div class="flex column">
        <q-checkbox v-model="model.show" :val="opt.value" :label="opt.label" :disable="opt.disable" v-for="opt in defaultContentOpts"/>
      </div>
    </q-card>
  </div>
  <div>
    <q-checkbox v-model="model.title.custom" label="Title"/>
    <q-checkbox v-model="model.subtitle.custom" label="Subtitle"/>
  </div>
  <div class="row">
    <div class="col-12" v-if="model.title.custom">
      <WidgetItemTitle v-model="model.title" label="Title"/>
    </div>
    <div class="col-12" v-if="model.subtitle.custom">
      <WidgetItemTitle v-model="model.subtitle" label="Subtitle"/>
    </div>
  </div>
</div>
</template>

<script setup>
import {ref, toRef, watch} from "vue";
import WidgetItemTitle from "components/home-page-builder/WidgetItemTitle";
import {TextAlignOpts} from "src/js/hp-builder";
import BlockAlignment from "components/home-page-builder/blocks/BlockAlignment";

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  type: {
    type: String,
    required: true
  },
})

const emit = defineEmits(['update:modelValue'])

/** @type {ToRef<IWidgetItem>} */
const model = toRef(props, 'modelValue')

const type = ref('item')

const positionOpts = [
  {label: 'Below', value: 'below'},
  {label: 'After', value: 'after'},
  {label: 'Before', value: 'before'},
  {label: 'Top', value: 'top'},
  {label: 'Bottom', value: 'bottom'},
  {label: 'Middle', value: 'middle'},
]
const defaultContentOpts = [
  {label: 'Title', value: 'title', disable: type.value !== 'category' && type.value !== 'item'},
  {label: 'Subtitle', value: 'subtitle', disable: type.value !== 'item'},
  {label: 'Offer', value: 'discount', disable: type.value !== 'item'},
  {label: 'Add to Cart', value: 'add-to-cart', disable: type.value !== 'item'},
]
const styleOpts = [
  {label: 'Square', value: 'square'},
  {label: 'Round', value: 'round'},
  {label: 'Rounded', value: 'rounded'},
]
</script>

<style scoped>

</style>
