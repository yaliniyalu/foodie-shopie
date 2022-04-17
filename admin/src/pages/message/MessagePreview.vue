<template>
  <DrawerComponent title="Message">
    <SafeComponent :loading="loading" :model="model" :error="!model && !loading">
      <q-card flat>

        <q-card-section>
          <div class="text-bold">{{ model.name }}</div>
          <div class="text-grey">+91 {{ model.phone }}</div>
        </q-card-section>

        <q-separator/>
        <q-card-section>
          <p class="q-mt-sm">{{ model.message }}</p>
        </q-card-section>
        <q-separator/>

        <template v-if="model.customer_id">
          <q-card-section>
            <CardCustomer :customer="model.customer"/>
          </q-card-section>
          <q-separator/>
        </template>

        <q-card-section>
          <div class="flex justify-between items-center">
            <DropdownButton :options="Status" :value="model.status" :change="changeStatus"/>
            <q-btn unelevated color="negative" label="Delete" @click="deleteReview"/>
          </div>
        </q-card-section>
      </q-card>
    </SafeComponent>
  </DrawerComponent>
</template>

<script setup>
import SafeComponent from "components/SafeComponent";
import {useRouter} from "vue-router";
import {defineEmits, ref, watch} from "vue";
import {api} from "boot/axios";
import ui from "src/ui";
import CardCustomer from "components/cards/CustomerCard";
import DropdownButton from "components/DropdownButton";
import {Status} from "src/js/model-helpers/messages";
import {useQuasar} from "quasar";
import DrawerComponent from "components/DrawerComponent";

const props = defineProps({
  id: {
    type: [Number, String],
    required: true
  }
})
const emit = defineEmits(['update'])

const router = useRouter()
const quasar = useQuasar()

const model = ref()
const loading = ref(true)

watch(props, () => load(), {immediate: true})

async function load() {
  try {
    model.value = null
    loading.value = true
    const res = await api.get('/message/' + props.id + '?include=customer:id,name,phone,customerType')
    model.value = res.data.data.message
  } catch (e) {
    ui.notifyUnexpectedError()
  } finally {
    loading.value = false
  }
}

async function changeStatus(option) {
  try {
    await api.patch('/message/' + model.value.id, {status: option.value})
    model.value.status = option.value
    emitUpdate()
  } catch (e) {
    ui.notifyUnexpectedError()
  }
}

async function deleteReview() {
  quasar.dialog({
    title: "Warning",
    color: "negative",
    message: "Do you want to permanently delete the message. <span class='text-negative text-bold'>This action cannot be reversed.</span>",
    html: true,
    ok: {label: "Delete", unelevated: true},
    cancel: true
  }).onOk(async () => {
    try {
      loading.value = true
      await api.delete('/message/' + model.value.id)
      emitUpdate()
      router.back()
    } catch (e) {
      ui.notifyUnexpectedError()
    } finally {
      loading.value = false
    }
  })
}

function emitUpdate() {
  emit('update', model.value)
}
</script>

<style lang="scss" scoped>

</style>
