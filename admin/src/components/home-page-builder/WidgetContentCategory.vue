<template>
  <div class="q-pa-md">
    <SelectCategory outlined stack-label label="Select Category" multiple :filter="{isActive: true}" :model-value="items" @update:model-value="updateItems" style="width: 250px"/>

    <q-separator class="q-mt-md q-mb-md"/>

    <div class="flex q-gutter-md">
      <div class="item" v-for="(i, index) in modelValue">
        <img :src="i.category.image" alt="">
        <div class="name">{{ i.category.label }}</div>
        <div class="q-gutter-sm">
          <q-input outlined stack-label dense label="Title" v-model="i.title"/>
          <q-input outlined stack-label dense label="Subtitle" v-model="i.subtitle"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, watch} from "vue";
import SelectCategory from "components/select/SelectCategory";

const props = defineProps({
  modelValue: { type: Array, required: true },
  widget: { type: Object, required: true }
})
const emit = defineEmits(['update:model-value'])

const items = ref([])

watch(props.modelValue, setItems, {immediate: true})

function setItems() {
  items.value = props.modelValue.map(v => v.category)
}

function parseWidgetItem(i) {
  return {
    type: 'category',
    item_id: null,
    category_id: i.value,
    title: i.title,
    subtitle: i.subtitle,
    image: null,
    category: i
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
