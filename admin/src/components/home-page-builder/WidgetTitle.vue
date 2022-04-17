<template>
  <div class="q-gutter-md q-pa-md">
    <div class="row">
      <q-input outlined stack-label label="Title" v-model="model.text"/>
    </div>
    <div class="row">
      <BlockAlignment v-model="model.align" class="col"/>
      <div class="col">
        <BlockFontSize v-model="model.size"/>
        <q-separator/>

        <div class="flex flex-center column q-pa-md">
          <q-btn unelevated color="primary" label="Padding" @click="openPaddingDialog"/>
          <span class="q-mt-md">{{ model.padding.join(', ')}}</span>
        </div>
      </div>

      <BlockColor v-model="model.color" class="col"/>
      <BlockTextStyle v-model="model.style" class="col"/>
    </div>
    <div class="row" v-if="type === 'item'">
      <q-checkbox label="Enable Button" v-model="model.btn.enable"/>
    </div>
    <div class="row" v-if="model.btn.enable">
      <q-input outlined stack-label label="Title" v-model="model.btn.label" class="col"/>
    </div>
    <div class="row" v-if="model.btn.enable">
      <BlockColor v-model="model.btn.textColor" label="Text Color" class="col"/>
      <BlockColor v-model="model.btn.bgColor" label="Bg Color" class="col"/>
    </div>
  </div>
  <q-dialog v-model="paddingDialog">
    <BlockPadding v-model="model.padding" style="width: 50%"/>
  </q-dialog>
</template>

<script setup>
import {ref, toRef} from "vue";
import {useQuasar} from "quasar";
import BlockPadding from "components/home-page-builder/blocks/BlockPadding";
import BlockAlignment from "components/home-page-builder/blocks/BlockAlignment";
import BlockFontSize from "components/home-page-builder/blocks/BlockFontSize";
import BlockTextStyle from "components/home-page-builder/blocks/BlockTextStyle";
import BlockColor from "components/home-page-builder/blocks/BlockColor";

const quasar = useQuasar()

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

/** @type {ToRef<IWidgetTitle>} */
const model = toRef(props, 'modelValue')

const paddingDialog = ref(false)

function openPaddingDialog() {
  paddingDialog.value = true
}
</script>

<style scoped>

</style>
