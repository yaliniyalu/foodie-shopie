<template>
  <q-page>
    <div class="row q-pa-md">
      <div class="col" v-if="!selected">
        <div class="flex justify-between q-pa-md">
          <div>
<!--            <q-select dense class="min-width-150" outlined stack-label label="Save" :options="['Live', 'Backup']" v-model="save"/>-->
          </div>
          <div class="q-gutter-md">
            <q-btn unelevated color="primary" label="Save" @click="onSave" :disable="!listIsDirty"/>
            <q-btn unelevated color="positive" label="Save Live" @click="onLive" :disable="listIsDirty"/>
          </div>
        </div>
        <div>
          <draggable
            v-model="list"
            @start="drag=true"
            @end="drag=false"
            :component-data="qListData"
            item-key="id"
            filter=".prevent-drag"
          >
            <template #item="{element}">
              <q-item clickable v-ripple>
                <q-item-section avatar>
                  <q-avatar color="primary" text-color="white" :icon="WidgetItemTypes.getIcon(element.type)"/>
                </q-item-section>

                <q-item-section>
                  <q-item-label>{{ element.name }}</q-item-label>
                  <q-item-label caption lines="1">{{ WidgetTemplates.getLabel(element.template) }}</q-item-label>
                </q-item-section>

                <q-item-section side>
                  <q-btn flat round icon="edit" color="primary" @click.stop="editWidget(element)"/>
                </q-item-section>
              </q-item>
            </template>
          </draggable>
        </div>
        <div class="text-center q-mt-md">
          <q-btn unelevated label="Add Widget" color="primary" @click="addWidget"/>
        </div>
      </div>
      <div class="col" v-else>
        <div class="q-ma-md">
          <q-btn icon="arrow_back" label="Back" color="primary" flat @click="selected = null"/>
        </div>
        <q-list bordered class="prevent-drag">
          <q-expansion-item label="Widget" group="widget" default-opened header-class="bg-teal text-white" expand-icon-class="text-white">
            <Widget v-model="selected" @delete="deleteWidget"/>
          </q-expansion-item>
          <q-expansion-item label="Widget Content" group="widget" header-class="bg-teal text-white" expand-icon-class="text-white" v-if="selected.template !== 'actions'">
            <WidgetContentItem     v-model="selected.list" :widget="selected" v-if="selected.type === 'item'"/>
            <WidgetContentCategory v-model="selected.list" :widget="selected" v-if="selected.type === 'category'"/>
            <WidgetContentBanner   v-model="selected.list" :widget="selected" v-if="selected.type === 'banner'"/>
          </q-expansion-item>
          <q-expansion-item label="Widget Title" group="widget" header-class="bg-teal text-white" expand-icon-class="text-white" v-if="selected.template !== 'actions'">
            <WidgetTitle v-model="selected.options.title" :type="selected.type"/>
          </q-expansion-item>
          <q-expansion-item label="Widget Item" group="widget" header-class="bg-teal text-white" expand-icon-class="text-white" v-if="selected.template !== 'actions'">
            <WidgetItem v-model="selected.options.item" :type="selected.type" v-memo/>
          </q-expansion-item>
        </q-list>
      </div>

      <div class="col-auto" style="width: 370px;">
        <q-page-sticky position="top-right">
          <iframe class="preview" ref="previewRef" :src="previewUrl" @load="loadPreview"/>
        </q-page-sticky>
      </div>
    </div>

    <q-inner-loading :showing="loading">
      <q-spinner-grid color="primary" size="50"/>
    </q-inner-loading>
  </q-page>
</template>

<script setup>
import draggable from 'vuedraggable'
import {nextTick, onBeforeUnmount, onMounted, ref, watch} from "vue";
import {useQuasar} from "quasar";
import WidgetSelector from "components/home-page-builder/WidgetSelector";
import {DefaultModel, WidgetTemplates, WidgetItemTypes} from "src/js/hp-builder";
import WidgetItem from "components/home-page-builder/WidgetItem";
import WidgetTitle from "components/home-page-builder/WidgetTitle";
import Widget from "components/home-page-builder/Widget";
import WidgetContentItem from "components/home-page-builder/WidgetContentItem";
import WidgetContentCategory from "components/home-page-builder/WidgetContentCategory";
import WidgetContentBanner from "components/home-page-builder/WidgetContentBanner";
import {api} from "boot/axios";
import ui from "src/ui";
import {useFormEdited} from "src/composables/form-edited";

const quasar = useQuasar()

const list = ref([])

const qListData = ref({
  bordered: true, class: "rounded-borders"
})

const drag = ref()
const previewRef = ref()

const previewUrl = process.env.ADMIN_URL + "/settings/home/preview"

/** @type {Ref<IWidget>} */
const selected = ref()
const listIsDirty = ref(false)

watch(list, () => {
  listIsDirty.value = true
  loadPreview()
}, {deep: true})

useFormEdited(listIsDirty)

window.addEventListener('message', onMessage)
onBeforeUnmount(() => window.removeEventListener('message', onMessage))

function onMessage(e) {
  loadPreview()
}

function addWidget() {
  quasar.dialog({
    component: WidgetSelector
  })
    .onOk(v => {
      list.value.push(DefaultModel.getWidget(v.title, v.template, v.type))
    })
}

function editWidget(ele) {
  selected.value = ele
}

function loadPreview() {
  previewRef.value.contentWindow.postMessage(JSON.stringify({type: 'widgets', widgets: list.value}), '*');
}

function deleteWidget(widget) {
  quasar.dialog({
    title: 'Confirm',
    message: 'Would you like to delete the widget?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    selected.value = null
    list.value = list.value.filter(f => f.id !== widget.id)
  })
}

const loading = ref(false)

async function loadSave() {
  try {
    loading.value = true
    const res = await api.get('home-widget/backup')
    list.value = res.data

    await nextTick(() => listIsDirty.value = false)
  } catch (e) {
    ui.notifyUnexpectedError()
  } finally {
    loading.value = false
  }
}

async function onSave() {
  loading.value = true
  try {
    await api.post('home-widget/backup', list.value)
    listIsDirty.value = false
  } catch (e) {
    ui.notifyUnexpectedError()
  } finally {
    loading.value = false
  }
}

async function onLive() {
  loading.value = true
  try {
    await api.post('home-widget')
    await loadSave()
  } catch (e) {
    ui.notifyUnexpectedError()
  } finally {
    loading.value = false
  }
}

onMounted(() => loadSave())
</script>

<style scoped>
.preview {
  width: 360px;
  height: 640px;
  border: 1px solid #ccc;
  margin: 5px;
}
</style>
