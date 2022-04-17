<template>
  <q-dialog
    ref="dialogRef"
    @hide="onDialogHide"
    position="bottom"
  >
    <q-card style="width: 100%">
      <q-card-section class="row items-center no-wrap">
        <q-list style="width: 100%">
          <q-item dense tag="label" v-for="o in options" :key="o.value">
            <q-item-section avatar>
              <q-radio v-model="selectedSort" :val="o.value" color="secondary" @update:model-value="changeSort" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ o.name }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import {useDialogPluginComponent} from "quasar";
import {onMounted, ref} from "vue";

const { dialogRef, onDialogHide, onDialogOK } = useDialogPluginComponent()

const emits = defineEmits([...useDialogPluginComponent.emits])
const props = defineProps({
  sort: {
    type: String,
    default: null
  }
})

const options = [
  {name: 'Relevance', value: 'relevance'},
  {name: 'Popularity', value: 'popularity'},
  {name: 'Newest First', value: 'newest_first'},
  {name: 'Price high to low', value: 'price_desc'},
  {name: 'Price low to high', value: 'price_asc'}
]

const selectedSort = ref()

onMounted(() => {
  selectedSort.value = props.sort
})

function changeSort() {
  dialogRef.value.hide()
  onDialogOK(selectedSort.value)
}
</script>

<style lang="scss" scoped>

</style>
