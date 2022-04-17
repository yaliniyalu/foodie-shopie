<template>
  <q-card>
    <q-card-section class="flex text-h6">
      Contact Details
      <q-space/>
      <q-btn type="submit" flat round color="primary" icon="save" :loading="loading" :disable="!isChanged" @click="onSave"/>
    </q-card-section>

    <q-separator/>

    <q-card-section class="q-gutter-md">
      <q-input outlined stack-label label="Company Name" v-model="model.name"/>
      <q-input outlined stack-label label="Company Title" v-model="model.tagline"/>

      <q-list bordered separator>
        <q-item v-for="(item, id) in model.contact" :key="id">
          <q-item-section avatar>
            <q-icon color="primary" :name="item.icon" />
          </q-item-section>

          <q-item-section>
            <q-item-label>{{ item.text }}</q-item-label>
            <q-item-label caption>{{ item.url }}</q-item-label>
          </q-item-section>

          <q-item-section class="flex q-gutter-md" style="flex-direction: row" side>
            <q-btn color="negative" flat round icon="delete" @click.stop="deleteDetail(id)">
              <q-tooltip>Delete</q-tooltip>
            </q-btn>

            <q-btn color="primary" flat round icon="edit" @click.stop="editDetail(id)">
              <q-tooltip>Edit</q-tooltip>
            </q-btn>
          </q-item-section>
        </q-item>
      </q-list>

      <div class="text-center">
        <q-btn color="primary" flat icon="add" label="add details" @click="resetDetails(); dialog = true"/>
      </div>
    </q-card-section>

    <q-separator/>

    <q-card-section>
      <div class="row q-col-gutter-md">
        <div class="col-auto q-mr-md" style="width: 128px">
          <ImagePreview v-model="model.logo.square" size="128x128" alt="256x256" style="width: 128px"/>
        </div>
        <div class="col">
          <ImagePreview v-model="model.logo.rect" alt="logo" style="height: 128px"/>
        </div>
      </div>
    </q-card-section>

    <q-inner-loading :showing="loading">
      <q-spinner-bars color="primary" size="50px"/>
    </q-inner-loading>
  </q-card>

  <q-dialog v-model="dialog">
    <q-card style="width: 50%">
      <q-card-section class="text-h6">
        Contact Detail
      </q-card-section>
      <q-separator/>
      <q-card-section>
        <div class="row q-col-gutter-md">
          <q-select class="col" outlined stack-label label="Type" :options="['Email', 'Phone', 'Address', 'Whatsapp', 'Website', 'Other']" v-model="contactDetails.type"/>
          <div class="col flex flex-center">
            <p class="text-h6 q-ma-none"><IconPicker v-model="contactDetails.icon"/></p>
          </div>
        </div>
        <div class="row q-col-gutter-md q-mt-sm">
          <q-input class="col" outlined stack-label label="Text" v-model="contactDetails.text" @change="onTextChange"/>
          <q-input class="col" outlined stack-label label="Url" v-model="contactDetails.url" :disable="contactDetails.type !== 'Other' && !isUrlEdit">
            <template v-slot:after v-if="contactDetails.type !== 'Other'">
              <q-btn flat round color="primary" icon="edit" @click="isUrlEdit = !isUrlEdit"/>
            </template>
          </q-input>
        </div>
      </q-card-section>
      <q-separator/>
      <q-card-actions align="right">
        <q-btn flat color="primary" label="Cancel" v-close-popup/>
        <q-btn unelevated color="primary" label="OK" @click="addDetails"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import IconPicker from "components/icon-picker/IconPicker";
import {nextTick, reactive, ref, watch} from "vue";
import {extend} from "quasar";
import {api} from "boot/axios";
import ui from "src/ui";
import {useFormEdited} from "src/composables/form-edited";
import ImagePreview from "components/ImagePreview";

const loading = ref(false)
const isChanged = ref()
const dialog = ref(false)
const selected = ref(null)
const contactDetails = reactive({
  icon: 'far fa-id-badge',
  text: '',
  url: '',
  type: 'Other'
})

const model = reactive({
  name: '',
  tagline: '',
  logo: {
    square: '',
    rect: ''
  },
  contact: []
})

watch(model, _ => isChanged.value = true, { deep: true })

watch(() => [contactDetails.text, contactDetails.type], onTextChange)
watch(() => contactDetails.type, onTypeChange)
const isUrlEdit = ref(false)

useFormEdited(isChanged)

const sBoxIcon = {
  Email: 'fas fa-at',
  Phone: 'fas fa-phone',
  Address: 'fas fa-map-marker-alt',
  Whatsapp: 'fab fa-whatsapp',
  Website: 'fas fa-globe',
  Other: 'far fa-id-badge'
}

async function onSave() {
  try {
    loading.value = true
    await api.put('/app-setting', [
      {id: 'company.name', value: model.name},
      {id: 'company.tagline', value: model.tagline},
      {id: 'company.logo.square', value: model.logo.square},
      {id: 'company.logo.rect', value: model.logo.rect},
      {id: 'company.contact', value: model.contact}
    ])
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
    const res = await api.get('/app-setting?filter[id][sw]=company.')
    const settings = res.data.data

    model.name = settings['company.name']
    model.tagline = settings['company.tagline']
    model.logo.square = settings['company.logo.square']
    model.logo.rect = settings['company.logo.rect']
    model.contact = settings['company.contact']

    await nextTick(() => isChanged.value = false)
  } catch (e) {
    ui.notifyUnexpectedError()
  } finally {
    loading.value = false
  }
}

function onTypeChange() {
  contactDetails.icon = sBoxIcon[contactDetails.type]
}

function onTextChange() {
  switch (contactDetails.type) {
    case "Email":
      contactDetails.url = "mailto:" + contactDetails.text
      return

    case "Phone":
      contactDetails.url = "tel:" + contactDetails.text
      return

    case "Whatsapp":
      contactDetails.url = "https://wa.me/" + contactDetails.text //whatsapp://send?phone=
      return

    case "Address":
      contactDetails.url = "https://maps.google.com/?q=" + contactDetails.text
      return

    default:
      contactDetails.url = ""
      return
  }
}

function resetDetails() {
  selected.value = null
  Object.assign(contactDetails, {
    icon: 'far fa-id-badge',
    text: '',
    url: '',
    type: 'Other'
  })
  isUrlEdit.value = false
}

function addDetails() {
  dialog.value = false

  if (selected.value === null) {
    model.contact.push(extend(true, {}, contactDetails))
  } else {
    model.contact[selected.value] = extend(true, {}, contactDetails)
  }
}

function editDetail(id) {
  selected.value = id
  Object.assign(contactDetails, model.contact[selected.value])
  dialog.value = true
}

function deleteDetail(id) {
  model.contact.splice(id, 1)
}

onLoad()
</script>

<style lang="scss" scoped>

</style>
