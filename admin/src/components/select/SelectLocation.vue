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
        <q-item-section>
          <q-item-label>{{ opt.label }}</q-item-label>
          <q-item-label caption>{{ opt.pincode }}</q-item-label>
        </q-item-section>
      </q-item>
    </template>

  </CustomSelect>
</template>

<script setup>
import CustomSelect from "components/select/CustomSelect";

const props = defineProps({
  modelValue: [Object, String, Number]
})

const emit = defineEmits(['update:modelValue'])

const url = 'location'
const resultKey = 'locations'

function queryBuilder(filter) {
  return {
    select: "pincode,name,id",
    filter: filter
  }
}

function parseOption(v) {
  return {
    label: v.name,
    value: v.id,

    id: v.id,
    name: v.name,
    pincode: v.pincode
  }
}
</script>

<style lang="scss" scoped>

</style>
