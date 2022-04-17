<template>
<div class="q-pa-md">
  <ItemSelect outlined stack-label label="Select Items" multiple :filter="{isActive: true}" :model-value="items" @update:model-value="updateItems" style="width: 250px"/>

  <q-separator class="q-mt-md q-mb-md"/>

  <div class="flex q-gutter-md">
    <div class="item" v-for="i in modelValue">
      <img :src="i.item.image" alt="">
      <div class="name">{{ i.item.label }}</div>
      <div class="category text-grey">{{ i.item.category }}</div>
      <div class="q-gutter-sm">
        <q-input outlined stack-label dense label="Title" v-model="i.title"/>
        <q-input outlined stack-label dense label="Subtitle" v-model="i.subtitle"/>
      </div>
    </div>
  </div>
</div>
</template>

<script setup>
import ItemSelect from "components/select/SelectItem";
import {ref, watch} from "vue";

const props = defineProps({
  modelValue: { type: Array, required: true },
  widget: { type: Object, required: true }
})
const emit = defineEmits(['update:model-value'])

const items = ref([])
const data = ref({})

watch(props.modelValue, setItems, {immediate: true})

function setItems() {
  items.value = props.modelValue.map(v => v.item)
}

function parseWidgetItem(i) {
  return {
    type: 'item',
    item_id: i.value,
    category_id: null,
    title: i.title,
    subtitle: i.subtitle,
    image: null,
    item: i
  }
}

function updateItems(i) {
  items.value = i;
  emit('update:model-value', i.map(item => parseWidgetItem(item)))
}
</script>

<style lang="scss" scoped>
.item {
  width: 150px;

  img {
    width: 100%;
  }
}
</style>
