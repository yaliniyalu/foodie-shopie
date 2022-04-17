<template>
  <DrawerComponent :title="!id ? 'Add Category' : model?.name">
    <SafeComponent :loading="loading" :model="model" :error="!model && !loading">
      <q-form @submit="save">
        <ImagePreview
          class="q-mb-sm"
          :aspect-ratio="3"
          size="300x100"
          v-model="model.bannerImage"
          alt="banner"
        />

        <div class="flex flex-center">
          <ImagePreview v-model="model.image" alt="image" required style="width: 40%"/>
        </div>

        <div class="q-mt-md">
          <q-input outlined stack-label label="Name" class="q-mb-sm" v-model="model.name" :rules="[ruleRequired]"/>
          <q-input outlined stack-label label="Description" autogrow v-model="model.description" hint=""/>
          <CategorySelect outlined stack-label label="Parent" emit-value use-input v-model="model._parentId"/>
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
  description: null,
  image: null,
  bannerImage: null,
  _parentId: null
}
const model = reactive({...defaultModel})

watch(props, () => props.id ? load() : reset(), {immediate: true})

async function load() {
  try {
    reset()
    loading.value = true
    const res = await api.get('/category/' + props.id)
    Object.assign(model, res.data.data.category)
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

  if (!model.image) {
    ui.notifyError("Image is required")
    return
  }

  loading.value = true
  try {
    const res = await api.post('category', {
      bannerImage: model.bannerImage ? getFileFromUrl(model.bannerImage) : null,
      image: model.image ? getFileFromUrl(model.image) : null,
      name: model.name,
      description: model.description,
      _parentId: model._parentId
    })

    ui.notifySuccess("Category Saved")
    model.id = res.data.data.category.id
    emit('update', res.data.data.category)
    router.replace(`/category/${res.data.data.category.id}`)
  } catch (e) {
    ui.notifyError("Unable to save data")
  } finally {
    loading.value = false
  }
}

async function update() {
  loading.value = true

  try {
    const res = await api.patch('category/' + props.id, {
      bannerImage: model.bannerImage ? getFileFromUrl(model.bannerImage) : null,
      image: model.image ? getFileFromUrl(model.image) : null,
      name: model.name,
      description: model.description,
      _parentId: model._parentId
    })

    ui.notifySuccess("Category Saved")
    model.id = res.data.data.category.id
    emit('update', res.data.data.category)
  } catch (e) {
    ui.notifyError("Unable to save data")
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>

</style>
