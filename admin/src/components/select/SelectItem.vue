<template>
  <CustomSelect
    v-bind="props"
    :model-value="modelValue"
    @update:model-value="v => emit('update:modelValue', v)"

    :url="url"
    :result-key="resultKey"
    :query-builder="queryBuilder"
    :option-parser="parseOption"
  >

    <template v-slot:option="{ itemProps, opt, selected, toggleOption }">
      <q-item v-bind="itemProps">
        <q-item-section avatar>
          <q-avatar>
            <img :src="opt.image" alt="">
          </q-avatar>
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ opt.label }}</q-item-label>
          <q-item-label caption v-if="opt.category">{{ opt.category }}</q-item-label>
        </q-item-section>
        <q-item-section side top>
          <q-item-label caption>{{ formatCurrency(opt.price) }}</q-item-label>
          <q-checkbox :model-value="selected" @update:model-value="toggleOption(opt)" v-if="multiple"/>
        </q-item-section>
      </q-item>
    </template>

  </CustomSelect>
</template>

<script setup>
import CustomSelect from "components/select/CustomSelect";
import {formatCurrency} from "src/js/utils";

const props = defineProps({
  modelValue: [Object, String, Number],
  multiple: {type: Boolean, default: false},
})

const emit = defineEmits(['update:modelValue'])

const url = "item"
const resultKey = 'items'

function queryBuilder(filter) {
  return {
    select: "id,name,price",
    filter: filter,
    include: "category:id,name;images"
  }
}

function parseOption(v) {
  return {
    label: v.name,
    value: v.id,
    id: v.id,
    name: v.name,
    image: v.images.find(i => i.isDefault)?.image,
    category: v.category?.name,
    price: v.price
  }
}
</script>

<style lang="scss" scoped>

</style>
