<template>
  <q-select
    v-bind="props"
    @filter="filterFn"
    @update:model-value="emitModelValue"
    :model-value="modelValue"
    :options="options" use-input

    ref="selectRef"
  >
    <template v-slot:no-option>
      <q-item>
        <q-item-section class="text-grey">
          No results
        </q-item-section>
      </q-item>
    </template>

    <template v-slot:selected="scope">
      <template v-if="multiple">
        <q-badge :color="color" class="q-mr-xs">{{ modelValue?.length ?? 0 }} selected</q-badge>
      </template>
      <template v-else>
        {{ option?.label }}
      </template>
    </template>

    <template v-for="(_, name) in $slots" v-slot:[name]="slotData">
      <slot :name="name" v-bind="slotData" />
    </template>
  </q-select>
</template>

<script setup>
import {ref, watch} from "vue";
import {api} from "boot/axios";
import qs from "qs";

const props = defineProps({
  modelValue: [Object, String, Number],
  emitValue: { type: Boolean, default: false },
  filter: {type: Object, default: null},
  multiple: {type: Boolean, default: false},
  color: {type: String, default: "primary"},

  fieldId: {type: String, default: 'id'},
  fieldSearch: {type: String, default: 'name'},
  url: {type: String, required: true},
  resultKey: {type: String, required: true},
  queryBuilder: {type: Function, required: true},
  optionParser: {type: Function, required: true}
})

const emit = defineEmits(['update:modelValue'])

const options = ref([]);
let originalOpts = [];
const option = ref(null)

watch(() => props.modelValue, getValue, {deep: true})

async function filterFn (val, update, abort) {
  if (!val && originalOpts.length) {
    update(() => {
      options.value = originalOpts
    })
    return
  }

  try {
    const filter = {[props.fieldSearch]: {ct: val}, ...props.filter}
    const opts = await loadData(filter)

    update(() => {
      options.value = opts

      if (!val) {
        originalOpts = options.value
      }
    })
  } catch (e) {
    abort()
  }
}

async function loadData(filter) {
  const paramsSerializer = (params) => qs.stringify(params)
  const params = props.queryBuilder(filter)
  const res = await api.get(props.url, {params, paramsSerializer})
  return res.data.data[props.resultKey].map(v => props.optionParser(v))
}

function emitModelValue(v) {
  emit('update:modelValue', v)
}

async function getValue() {
  if (props.emitValue) {
    if (props.modelValue === null) {
      option.value = null;
      return
    }

    const v = options.value.find(v => v.value === props.modelValue)
    if (v === undefined && !props.multiple) {
      const opts = await loadData({[props.fieldId]: props.modelValue})
      option.value = opts[0] ? props.optionParser(opts[0]) : null;
      options.value.push(option.value)
      return
    }

    option.value = v
    return
  }
  option.value = props.modelValue
}

const selectRef = ref()
defineExpose({
  selectRef
})
</script>

<style lang="scss" scoped>

</style>
