<template>
  <CustomSelect
    v-bind="props"
    :model-value="modelValue"
    @update:model-value="v => emit('update:modelValue', v)"

    :url="url"
    :result-key="resultKey"
    :query-builder="queryBuilder"
    :option-parser="parseOption"

    ref="selectRef"
  >

    <template v-slot:option="{ itemProps, opt, selected, toggleOption }">
      <q-item v-bind="itemProps">
        <q-item-section avatar>
          <q-avatar>
            <img :src="getAvatarUrl(opt)" alt="">
          </q-avatar>
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ opt.label }} <span class="text-grey">({{opt.phone}})</span></q-item-label>
          <q-item-label caption><StatusBadge :options="AccountTypes" :value="opt.type"/></q-item-label>
        </q-item-section>
      </q-item>
    </template>

  </CustomSelect>
</template>

<script setup>
import CustomSelect from "components/select/CustomSelect";
import {getAvatarUrl} from "src/js/utils";
import StatusBadge from "components/badge/StatusBadge";
import {AccountTypes} from "src/js/model-helpers/accounts";
import {ref} from "vue";

const props = defineProps({
  modelValue: [Object, String, Number]
})

const emit = defineEmits(['update:modelValue'])

const url = 'account'
const resultKey = 'accounts'
const selectRef = ref()

function queryBuilder(filter) {
  return {
    select: "name,id,email,phone,image,type",
    filter: filter
  }
}

function parseOption(v) {
  return {
    label: v.name,
    value: v.id,

    id: v.id,
    name: v.name,
    email: v.email,
    phone: v.phone,
    image: v.image,
    type: v.type
  }
}

defineExpose({
  showPopup: () => {
    selectRef.value.selectRef.showPopup()
  }
})
</script>

<style lang="scss" scoped>

</style>
