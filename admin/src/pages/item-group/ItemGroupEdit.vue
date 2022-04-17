<template>
  <DrawerComponent :title="!id ? 'Add Group' : model?.name">
    <SafeComponent :loading="loading" :model="model" :error="!model && !loading">
      <q-form @submit="save">
        <div class="q-mt-md">
          <q-input outlined stack-label label="Name" class="q-mb-sm" v-model="model.name" :rules="[ruleRequired]"/>
          <q-input outlined stack-label label="Title" autogrow v-model="model.title" :rules="[ruleRequired]"/>
        </div>

        <div class="q-mt-lg text-center">
          <q-btn type="submit" color="secondary" unelevated label="Save" :loading="loading"/>
        </div>
      </q-form>
    </SafeComponent>
  </DrawerComponent>
</template>

<script setup>
import ImagePreview from "components/ImagePreview";
import {computed, onMounted, reactive, ref, toRef, watch} from "vue";
import {api} from "boot/axios";
import ui from "src/ui";
import {ruleRequired} from 'src/js/validation-rules';
import {getFileFromUrl} from "src/js/utils";
import CategorySelect from "components/select/SelectCategory";
import SafeComponent from "components/SafeComponent";
import DrawerComponent from "components/DrawerComponent";
import {useRouter} from "vue-router";

const props = defineProps({
  id: { type: [Number, String], default: null }
})
const emit = defineEmits(['save'])

const router = useRouter()

const loading = ref();
const defaultModel = {
  id: null,
  name: null,
  title: null
}
const model = reactive({...defaultModel})

watch(props, () => props.id ? load() : reset(), {immediate: true})

async function load() {
  try {
    reset()
    loading.value = true
    const res = await api.get('/item/group/' + props.id)
    Object.assign(model, res.data.data.group)
  } catch (e) {
    ui.notifyUnexpectedError()
  } finally {
    loading.value = false
  }
}

function reset() {
  Object.assign(model, defaultModel)
}

async function save() {
  if (props.id) {
    return update()
  }

  loading.value = true
  try {
    const res = await api.post('item/group', {
      name: model.name,
      title: model.title
    })

    ui.notifySuccess("Item Group Saved")
    model.id = res.data.data.group.id
    emit('update', res.data.data.group)
    router.replace(`/item-group/${res.data.data.group.id}`)
  } catch (e) {
    ui.notifyError("Unable to save data")
  } finally {
    loading.value = false
  }
}

async function update() {
  loading.value = true

  try {
    const res = await api.put('item/group/' + props.id, {
      name: model.name,
      title: model.title
    })

    ui.notifySuccess("Item Group Saved")
    model.id = res.data.data.group.id
    emit('update', res.data.data.group)
  } catch (e) {
    ui.notifyError("Unable to save data")
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>

</style>
