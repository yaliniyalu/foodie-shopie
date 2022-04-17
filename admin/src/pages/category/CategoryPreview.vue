<template>
  <DrawerComponent :title="model?.name" :edit="model && `/category/${model?.id}/edit`">
    <SafeComponent :loading="loading" :model="model" :error="!model && !loading">
      <div class="q-gutter-y-md">
        <img class="img" :src="model.bannerImage" v-if="model.bannerImage" alt=""/>

        <div class="row q-col-gutter-sm">
          <div class="col-4">
            <q-img class="img" :src="model.image" alt=""/>
          </div>
          <div class="col-8">
            <div class="text-h6">{{ model.name }}</div>
            <div class="text-grey" v-if="model.parent">{{ model.parent.name }}</div>
            <div>{{ model.description }}</div>
          </div>
        </div>

        <q-separator/>

        <div class="flex flex-center q-gutter-x-md">
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
import {ref, watch} from "vue";
import {api} from "boot/axios";
import ui from "src/ui";
import SafeComponent from "components/SafeComponent";
import UserActionCard from "components/UserActionCard";
import DrawerComponent from "components/DrawerComponent";
import DropdownButton from "components/DropdownButton";
import {ActiveStatus} from "src/js/model-helpers/category";

const props = defineProps({
  id: {
    type: [Number, String],
    required: true
  }
})
const emit = defineEmits(['update'])

const loading = ref();
const model = ref()

watch(props, () => props.id && load(), {immediate: true})

async function load() {
  try {
    model.value = null
    loading.value = true
    const res = await api.get('/category/' + props.id + `?include=parent:id,name;createdBy:id,name,email,phone,image;updatedBy:id,name,email,phone,image`)
    model.value = res.data.data.category
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
    const res = await api.patch('/category/' + props.id, { isActive: status.value })
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
