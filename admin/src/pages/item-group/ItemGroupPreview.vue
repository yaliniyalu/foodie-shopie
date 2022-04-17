<template>
  <DrawerComponent :title="model?.name">
    <SafeComponent :loading="loading" :model="model" :error="!model && !loading">
      <div class="q-gutter-y-md">
        <div class="row q-col-gutter-sm">
          <div class="col text-center">
            <div class="text-h6">{{ model.name }}</div>
            <div>{{ model.title }}</div>
          </div>
        </div>

        <q-list bordered v-if="model.items.length" separator>
          <q-item v-for="item in model.items" v-ripple clickable>
            <q-item-section>
              <q-item-label>{{item.name}}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-badge color="brown" :label="item.group_value"/>
            </q-item-section>
          </q-item>
        </q-list>

        <p class="text-grey text-center" v-else>No items in this group</p>

        <div class="flex flex-center q-pt-lg q-gutter-x-md">
          <div>
            <q-btn unelevated color="negative" label="Delete" @click="promptDeleteGroup" :loading="deleting"/>
          </div>
        </div>
      </div>
    </SafeComponent>
  </DrawerComponent>
</template>

<script setup>
import {onMounted, ref, watch} from "vue";
import {api} from "boot/axios";
import ui from "src/ui";
import SafeComponent from "components/SafeComponent";
import UserActionCard from "components/UserActionCard";
import DrawerComponent from "components/DrawerComponent";
import {useRouter} from "vue-router";
import {useQuasar} from "quasar";

const props = defineProps({
  id: {
    type: [Number, String],
    required: true
  }
})
const emit = defineEmits(['update'])

const router = useRouter()
const quasar = useQuasar()

const loading = ref();
const model = ref()

watch(props, () => props.id && load(), {immediate: true})

async function load() {
  try {
    model.value = null
    loading.value = true
    const res = await api.get('/item/group/' + props.id + `?include=items:id,name,group_id,group_value`)
    model.value = res.data.data.group
  } catch (e) {
    ui.notifyUnexpectedError()
  } finally {
    loading.value = false
  }
}

const deleting = ref()

function promptDeleteGroup() {
  quasar.dialog({
    title: "Warning",
    color: "negative",
    message: "Do you want to permanently delete the group. <span class='text-negative text-bold'>This action cannot be reversed.</span>",
    html: true,
    ok: {label: "Delete", unelevated: true},
    cancel: true
  }).onOk(async () => {
    await deleteGroup()
  })
}

async function deleteGroup() {
  try {
    deleting.value = true
    const res = await api.delete('/item/group/' + props.id)
    emit('update', model.value)
    ui.notifySuccess("Group deleted")
    router.back()
  } catch (e) {
    ui.notifyUnexpectedError()
  } finally {
    deleting.value = false
  }
}

</script>

<style lang="scss" scoped>

</style>
