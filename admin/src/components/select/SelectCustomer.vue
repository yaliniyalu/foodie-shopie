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
      <q-item v-bind="itemProps" v-if="opt">
        <q-item-section>
          <q-item-label>+91 {{ opt.label }}</q-item-label>
          <q-item-label caption v-if="opt.name">{{ opt.name }}</q-item-label>
        </q-item-section>
        <q-item-section side top>
          <q-item-label caption v-if="opt.type === 'Prime'">
            <BadgePrime/>
          </q-item-label>
          <q-checkbox :model-value="selected" @update:model-value="toggleOption(opt)" v-if="multiple"/>
        </q-item-section>
      </q-item>
    </template>

  </CustomSelect>
</template>

<script setup>
import CustomSelect from "components/select/CustomSelect";
import BadgePrime from "components/badge/PrimeBadge";

const props = defineProps({
  modelValue: [Object, String, Number],
  multiple: {type: Boolean, default: false}
})

const emit = defineEmits(['update:modelValue'])

const url = 'customer'
const resultKey = 'customers'

function queryBuilder(filter) {
  if (filter.name) {
    filter.phone = filter.name
    delete filter.name
  }

  return {
    select: "id,name,customer_type,phone",
    filter: filter
  }
}

function parseOption(v) {
  return {
    label: v.phone,
    value: v.id,
    id: v.id,
    name: v.name,
    type: v.customer_type,
    phone: v.phone
  }
}
</script>

<style lang="scss" scoped>

</style>
