<template>
  <q-card>
    <q-card-section class="text-h6">{{label}}</q-card-section>
    <q-separator/>
    <q-card-section>
      <div class="row">
        <BlockFontSize v-model="model.size" class="col"/>
        <BlockColor v-model="model.color" class="col"/>
        <BlockTextStyle v-model="model.style" class="col"/>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import {toRef} from "vue";
import BlockColor from "components/home-page-builder/blocks/BlockColor";
import BlockTextStyle from "components/home-page-builder/blocks/BlockTextStyle";
import BlockFontSize from "components/home-page-builder/blocks/BlockFontSize";

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  label: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

/** @type {ToRef<IWidgetItemText>} */
const model = toRef(props, 'modelValue')
</script>

<style scoped>

</style>
