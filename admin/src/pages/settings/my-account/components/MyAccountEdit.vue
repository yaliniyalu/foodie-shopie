<template>
  <div style="width: 300px">
    <q-card v-if="!isEdit">
      <q-card-section class="flex justify-start items-center">
        <ImagePreview style="width: 25%" layout="round" :src="getAvatarUrl(model)" readonly/>

        <div class="text-left q-ml-md">
          <div class="text-h6">{{ model.name }}</div>
          <div><StatusBadge :options="AccountTypes" :value="model.type"/></div>
        </div>
      </q-card-section>
      <q-separator/>
      <q-card-section class="text-bold text-grey text-center">
        <div>{{ model.email }}</div>
        <div>{{ model.phone }}</div>
      </q-card-section>
      <q-separator/>
      <q-card-actions align="center">
        <q-btn color="primary" unelevated label="Edit" class="full-width" @click="isEdit = true"/>
      </q-card-actions>
      <q-inner-loading :showing="loading">
        <q-spinner-bars color="primary" size="50px"/>
      </q-inner-loading>
    </q-card>

    <q-card v-else>
      <q-card-section class="q-gutter-md">
        <ImagePreview layout="round" v-model="model.image" required/>
        <q-input outlined stack-label label="Name" class="q-mb-sm" v-model="model.name" :rules="[ruleRequired]"/>
        <q-input outlined stack-label label="Email" class="q-mb-sm" v-model="model.email" :rules="[ruleRequired, ruleEmail, ruleCheckEmail]" :debounce="650" lazy-rules/>
        <q-input outlined stack-label label="Phone" class="q-mb-sm" v-model="model.phone" :rules="[ruleRequired, ruleMobile, ruleCheckPhone]" :debounce="650" lazy-rules mask="##########"/>
      </q-card-section>
      <q-separator/>
      <q-card-actions align="center">
        <q-btn color="primary" unelevated label="Update" class="full-width" @click="update" :loading="loading"/>
      </q-card-actions>
    </q-card>
  </div>
</template>

<script setup>
import ImagePreview from "components/ImagePreview";
import {api} from "boot/axios";
import {reactive, ref} from "vue";
import ui from "src/ui";
import StatusBadge from "components/badge/StatusBadge";
import {AccountTypes} from "src/js/model-helpers/accounts";
import {getAvatarUrl} from "src/js/utils";
import {ruleEmail, ruleMobile, ruleRequired} from "src/js/validation-rules";
import {useStore} from "vuex";

const store = useStore()
const loading = ref()
const model = reactive({
  id: '',
  name: '',
  email: '',
  image: '',
  phone: '',
  type: ''
})
const isEdit = ref()

async function onLoad() {
  try {
    loading.value = true
    const res = await api.get('/auth/me')
    Object.assign(model, res.data.data)
  } catch (e) {
    ui.notifyUnexpectedError()
  } finally {
    loading.value = false
  }
}

async function update() {
  loading.value = true

  try {
    const res = await api.patch('auth/me', {
      name: model.name,
      email: model.email,
      phone: model.phone,
      image: model.image
    })
    ui.notifySuccess("Account Saved")

    isEdit.value = false
    await onLoad()
    await store.dispatch("app/loadUser")
  } catch (e) {
    ui.notifyError("Unable to save data")
  } finally {
    loading.value = false
  }
}

async function ruleCheckEmail(val) {
  try {
    const res = await api.get(`account?select=id&filter[email]=${val}` + (model.id ? `&filter[id][eq][not]=${model.id}` : ''))
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
    const res = await api.get(`account?select=id&filter[phone]=${val}` + (model.id ? `&filter[id][eq][not]=${model.id}` : ''))
    if (!res.data.data.accounts.length) {
      return true
    }
    return "Mobile already exists"
  } catch (e) {
    return "Unexpected Error"
  }
}

onLoad()
</script>

<style lang="scss" scoped>

</style>
