<template>
  <q-dialog
    ref="dialogRef" @hide="onDialogHide"
    persistent
    maximized
    transition-show="jump-up"
    transition-hide="jump-down"
  >
    <q-card flat>
      <q-toolbar class="text-primary">
        <q-btn flat round icon="arrow_back" v-close-popup/>
        <q-toolbar-title>{{ title }}</q-toolbar-title>
      </q-toolbar>
      <q-separator/>

      <q-card-section class="bootstrap-reset">
        <div v-html="content"/>
      </q-card-section>

      <q-inner-loading :showing="loading">
        <q-spinner-bars :size="50" color="primary"/>
      </q-inner-loading>
    </q-card>
  </q-dialog>
</template>

<script setup>
import {useDialogPluginComponent} from "quasar";
import {computed, onMounted, ref} from "vue";
import {api} from "boot/axios";
import ui from "src/ui";

defineEmits(useDialogPluginComponent.emits)
const { dialogRef, onDialogHide } = useDialogPluginComponent()

const props = defineProps({
  page: {
    type: String,
    required: true
  }
})

const loading = ref()
const content = ref()

const title = computed(() => {
  switch (props.page) {
    case 'privacy':
      return 'Privacy Policy'
    case 'terms':
      return 'Terms & Conditions'
  }
})

onMounted(() => {
  load()
})

async function load() {
  loading.value = true

  try {
    const res = await api.get('settings/' + props.page)
    content.value = res.data.data
  } catch (e) {
    ui.notifyUnexpectedError()
    dialogRef.value.hide()
  } finally {
    loading.value = false
  }
}

</script>

<style lang="scss" scoped>

</style>
