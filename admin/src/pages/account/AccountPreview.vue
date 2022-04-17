<template>
  <DrawerComponent :title="model?.name" :edit="model && `/account/${model?.id}/edit`">
    <SafeComponent :loading="loading" :model="model" :error="!model && !loading">
      <div class="q-gutter-y-md">
        <div class="row q-col-gutter-sm">
          <div class="col-4">
            <ImagePreview class="img" :src="model.image" alt="image" readonly/>
          </div>
          <div class="col-8">
            <div class="text-h6">{{ model.name }}</div>
            <div class="q-mt-sm">{{ model.email }}</div>
            <div>{{ model.phone }}</div>
          </div>
        </div>

        <q-separator/>

        <div class="flex flex-center q-mt-md q-mb-md">
          <DropdownButton :options="ActiveStatus" :value="model.isActive" :change="updateStatus"/>
        </div>

        <q-separator/>


        <div class="q-gutter-md q-mt-md" v-if="!loading">
          <UserActionCard :user="model.createdBy" action="Created" :date="model.createdAt"/>
          <UserActionCard :user="model.updatedBy" action="Updated" :date="model.updatedAt" v-if="model.updatedBy"/>
        </div>
      </div>
    </SafeComponent>
  </DrawerComponent>
</template>

<script setup>
import {reactive, ref, watch} from "vue";
import {api} from "boot/axios";
import ui from "src/ui";
import SafeComponent from "components/SafeComponent";
import DrawerComponent from "components/DrawerComponent";
import ImagePreview from "components/ImagePreview";
import UserActionCard from "components/UserActionCard";
import DropdownButton from "components/DropdownButton";
import {ActiveStatus} from "src/js/model-helpers/accounts";

const props = defineProps({
  id: {
    type: [Number, String],
    required: true
  }
})
const emit = defineEmits(['update'])

const loading = ref()
const model = ref()

const deletingLoc = reactive({})
const location = ref(null)

watch(props, () => props.id && load(), {immediate: true})

async function load() {
  try {
    model.value = null
    loading.value = true
    const res = await api.get('/account/' + props.id + `?include=createdBy:id,name,email,image,phone;updatedBy:id,name,email,image,phone`)
    model.value = res.data.data.account
  } catch (e) {
    ui.notifyUnexpectedError()
  } finally {
    loading.value = false
  }
}

const updatingStatus = ref()

async function updateStatus(status) {
  try {
    updatingStatus.value = true
    const res = await api.patch('/account/' + props.id, { isActive: status.value })
    await load()
    emit('update', model.value)
  } catch (e) {
    ui.notifyUnexpectedError()
  } finally {
    updatingStatus.value = false
  }
}
</script>

<style lang="scss" scoped>

</style>
