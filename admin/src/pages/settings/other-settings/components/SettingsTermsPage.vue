<template>
  <q-card>
    <q-card-section class="flex text-h6">
      {{ pageType === 'terms' ? 'Terms & Conditions' : 'Privacy Policy' }}
      <q-space/>
      <q-btn type="submit" flat round color="primary" icon="save" :loading="loading" :disable="!isChanged" @click="onSave"/>
    </q-card-section>
    <q-separator/>

    <q-card-section class="bootstrap-reset">
      <QuillEditor theme="snow" toolbar="full" v-model:content="data" contentType="html" />
    </q-card-section>

    <q-inner-loading :showing="loading">
      <q-spinner-bars color="primary" size="50px"/>
    </q-inner-loading>
  </q-card>
</template>

<script setup>
import {computed, nextTick, ref, watch} from "vue";
import {api} from "boot/axios";
import ui from "src/ui";
import {useFormEdited} from "src/composables/form-edited";
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css';

const props = defineProps({
  pageType: {
    type: String,
    required: true
  }
})

const id = computed(() => 'company.' + props.pageType)

const loading = ref(false)
const isChanged = ref()
const data = ref("")

watch(data, _ => isChanged.value = true)

useFormEdited(isChanged)

async function onSave() {
  try {
    loading.value = true
    await api.put('/app-setting', [{id: id.value, value: data.value}])
    isChanged.value = false
    ui.notifySuccess('Updated')
  } catch (e) {
    ui.notifyUnexpectedError()
  } finally {
    loading.value = false
  }
}

async function onLoad() {
  try {
    loading.value = true
    const res = await api.get('/app-setting/' + id.value)
    data.value = res.data.data[id.value]
    await nextTick(() => isChanged.value = false)
  } catch (e) {
    ui.notifyUnexpectedError()
  } finally {
    loading.value = false
  }
}

onLoad()
</script>

<style lang="scss" scoped>

</style>
