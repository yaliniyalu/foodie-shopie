<template>
  <DrawerComponent :title="!id ? 'Add Account' : model?.name">
    <SafeComponent :loading="loading" :model="model" :error="!model && !loading">
      <q-form @submit="save">
        <div class="flex flex-center">
          <ImagePreview v-model="model.image" alt="image" required style="width: 40%"/>
        </div>

        <div class="q-mt-md">
          <q-input outlined stack-label label="Name" class="q-mb-sm" v-model="model.name" :rules="[ruleRequired]"/>
          <q-input outlined stack-label label="Email" class="q-mb-sm" v-model="model.email" :rules="[ruleRequired, ruleEmail, ruleCheckEmail]" :debounce="650" lazy-rules/>
          <q-input outlined stack-label label="Phone" class="q-mb-sm" v-model="model.phone" :rules="[ruleRequired, ruleMobile, ruleCheckPhone]" :debounce="650" lazy-rules mask="##########"/>
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
import {reactive, ref, watch} from "vue";
import {api} from "boot/axios";
import ui from "src/ui";
import {ruleRequired, ruleMobile, ruleEmail} from 'src/js/validation-rules';
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
  _id: null,
  name: null,
  image: null,
  email: null,
  phone: null
}
const model = reactive({...defaultModel})

watch(props, () => props.id ? load() : reset(), {immediate: true})

async function load() {
  try {
    reset()
    loading.value = true
    const res = await api.get('/account/' + props.id)
    Object.assign(model, res.data.data.account)
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
    const res = await api.post('account', model)

    ui.notifySuccess("Account Saved")
    emit('update', res.data.data.account)

    await router.replace('/account/' + res.data.data.account.id)
  } catch (e) {
    ui.notifyError("Unable to save data")
  } finally {
    loading.value = false
  }
}

async function update() {
  loading.value = true

  try {
    const res = await api.patch('account/' + props.id, model)

    ui.notifySuccess("Account Saved")
    emit('update', res.data.data.account)
  } catch (e) {
    ui.notifyError("Unable to save data")
  } finally {
    loading.value = false
  }
}

async function ruleCheckEmail(val) {
  try {
    const res = await api.get(`account?select=id&filter[email]=${val}` + (props.id ? `&filter[id][eq][not]=${props.id}` : ''))
    if (!res.data.data.accounts.length) {
      return true
    }
    return "Email already exists"
  } catch (e) {
    return "Unexpected Error"
  }
}

async function ruleCheckPhone(val) {
  try {
    const res = await api.get(`account?select=id&filter[phone]=${val}` + (props.id ? `&filter[id][eq][not]=${props.id}` : ''))
    if (!res.data.data.accounts.length) {
      return true
    }
    return "Mobile already exists"
  } catch (e) {
    return "Unexpected Error"
  }
}
</script>

<style lang="scss" scoped>

</style>
