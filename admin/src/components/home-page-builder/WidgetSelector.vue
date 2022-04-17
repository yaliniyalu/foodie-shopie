<template>
  <q-dialog
    ref="dialogRef" @hide="onDialogHide"
    transition-show="jump-up"
    transition-hide="jump-down"
  >
    <q-card style="width: 50%">
      <q-card-section class="q-gutter-md">
        <q-input outlined stack-label v-model="title" label="Title"/>
        <q-select outlined stack-label emit-value label="Widget" v-model="template" :options="templateOptions"/>
        <q-select outlined stack-label emit-value label="Type" v-model="type" :options="typeOptions"/>
      </q-card-section>
      <q-card-actions align="center">
        <q-btn label="Add Widget" color="primary" @click="addWidget" :disable="!(title && template && type)"/>
      </q-card-actions>
    </q-card>
</q-dialog>
</template>

<script setup>
import {ref} from "vue";

import {useDialogPluginComponent} from "quasar";
import {WidgetItemTypes, WidgetTemplates} from "src/js/hp-builder";

defineEmits(useDialogPluginComponent.emits)
const { dialogRef, onDialogHide, onDialogOK } = useDialogPluginComponent()

const templateOptions = WidgetTemplates.getOptions()
const typeOptions = WidgetItemTypes.getOptions()

const title = ref()
const template = ref('swiper')
const type = ref('item')

function addWidget() {
  if (title.value && template.value && type.value) {
    onDialogOK({ title: title.value, template: template.value, type: type.value})
  }
}

</script>

<style scoped>

</style>
