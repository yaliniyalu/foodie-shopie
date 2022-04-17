<template>
  <DrawerComponent :title="!id ? 'Add Location' : model?.name">
    <SafeComponent :loading="loading" :model="model" :error="!model && !loading">
      <q-form @submit="save">
        <div class="q-mt-md">
          <q-input outlined stack-label label="Location" class="q-mb-sm" v-model="location" :rules="[ruleRequired]" readonly>
            <template v-slot:append>
              <q-btn flat round color="primary" icon="gps_fixed" @click="openMap" :disable="!!props.id"/>
            </template>
          </q-input>
          <q-input outlined stack-label label="Name" class="q-mb-sm" v-model="model.name" :rules="[ruleRequired]" :loading="loadingAddress"/>
          <q-input outlined stack-label label="Pincode" class="q-mb-sm" v-model="model.pincode" :rules="[ruleRequired]" :readonly="!!props.id"/>
          <q-input outlined stack-label label="Fee" class="q-mb-sm" v-model="model.fee" :rules="[ruleRequired, rulePositiveNumber]"/>
        </div>

        <div class="q-mt-lg text-center">
          <q-btn type="submit" color="secondary" unelevated label="Save" :loading="loading"/>
        </div>
      </q-form>
    </SafeComponent>
  </DrawerComponent>
</template>

<script setup>
import {computed, reactive, ref, watch} from "vue";
import {api} from "boot/axios";
import ui from "src/ui";
import {ruleRequired, rulePositiveNumber} from 'src/js/validation-rules';
import SafeComponent from "components/SafeComponent";
import DrawerComponent from "components/DrawerComponent";
import {useRouter} from "vue-router";
import {useQuasar} from "quasar";
import LocationPicker from "components/LocationPicker";

const props = defineProps({
  id: { type: [Number, String], default: null }
})
const emit = defineEmits(['save'])

const router = useRouter()
const quasar = useQuasar()

const loading = ref()
const loadingAddress = ref()
const defaultModel = {
  id: null,
  name: null,
  lat: null,
  lng: null,
  fee: null,
  pincode: null
}
const model = reactive({...defaultModel})

watch(props, () => props.id ? load() : reset(), {immediate: true})

const location = computed(() => model.lat && model.lat + ", " + model.lng)

async function load() {
  try {
    reset()
    loading.value = true
    const res = await api.get('/location/' + props.id)
    Object.assign(model, res.data.data.location)
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
    const res = await api.post('location', model)

    ui.notifySuccess("Location Saved")
    emit('update', res.data.data.location)

    await router.replace('/settings/location/' + res.data.data.location.id)
  } catch (e) {
    ui.notifyError("Unable to save data")
  } finally {
    loading.value = false
  }
}

async function update() {
  loading.value = true

  try {
    const res = await api.patch('location/' + props.id, model)

    ui.notifySuccess("Location Saved")
    emit('update', res.data.data.location)
  } catch (e) {
    ui.notifyError("Unable to save data")
  } finally {
    loading.value = false
  }
}

async function loadAddress() {
  loadingAddress.value = true

  try {
    const res = await api.get('geocode/pincode?pincode=' + model.pincode)
    model.name = res.data.data?.location.Name
  } catch (e) {
  } finally {
    loadingAddress.value = false
  }
}

async function ruleCheckPincode(val) {
  if (props.id) {
    return true
  }

  if (val.length < 6) {
    return "Enter valid pincode"
  }

  try {
    const res = await api.get(`location?select=id&filter[pincode]=${val}` + (props.id ? `&filter[id][eq][1]=${props.id}` : ''))
    if (!res.data.data.locations.length) {
      return true
    }
    return "Pincode already exists"
  } catch (e) {
    return "Unexpected Error"
  }
}

function openMap() {
  quasar.dialog({
    component: LocationPicker
  }).onOk((data) => {
    model.lat = data.location.lat
    model.lng = data.location.lng

    if (data.place) model.name = data.place.split(',')[0]
    if (data.pincode) model.pincode = data.pincode
  })
}
</script>

<style lang="scss" scoped>

</style>
