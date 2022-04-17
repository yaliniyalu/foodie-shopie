<template>
  <DrawerComponent :title="model?.name" :edit="model && `/settings/location/${model?.id}/edit`">
    <SafeComponent :loading="loading" :model="model" :error="!model && !loading">
      <q-list bordered separator>
        <q-item clickable v-ripple>
          <q-item-section>
            <q-item-label>{{model.name}}</q-item-label>
            <q-item-label caption>Name</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple>
          <q-item-section>
            <q-item-label>{{model.pincode}}</q-item-label>
            <q-item-label caption>Pincode</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple>
          <q-item-section>
            <q-item-label class="font-mono">{{model.fee}}</q-item-label>
            <q-item-label caption>Delivery Fee</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple>
          <q-item-section>
            <q-btn flat color="primary" label="View on Google Maps" @click="openMap"/>
          </q-item-section>
        </q-item>
      </q-list>

      <div class="q-mt-md q-mb-md q-gutter-y-md">
        <q-separator/>
        <div class="flex flex-center">
          <DropdownButton :options="ActiveStatus" :value="model.isActive" :change="updateStatus"/>
        </div>
        <q-separator/>
      </div>
    </SafeComponent>
  </DrawerComponent>
</template>

<script setup>
import {ref, watch} from "vue";
import {api} from "boot/axios";
import ui from "src/ui";
import SafeComponent from "components/SafeComponent";
import DrawerComponent from "components/DrawerComponent";
import DropdownButton from "components/DropdownButton";
import {ActiveStatus} from "src/js/model-helpers/locations";

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
    const res = await api.get('/location/' + props.id + `?select=id,name,pincode,lat,lng,fee,isActive`)
    model.value = res.data.data.location
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
    const res = await api.patch('/location/' + props.id, { isActive: status.value })
    await load()
    emit('update', model.value)
  } catch (e) {
    ui.notifyUnexpectedError()
  } finally {
    updatingStatus.value = false
  }
}

function openMap() {
  window.open(`https://maps.google.com/?q=${model.value.lat},${model.value.lng}`, '_blank');
}
</script>

<style lang="scss" scoped>

</style>
