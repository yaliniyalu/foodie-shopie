<template>
  <q-btn-dropdown v-bind="$attrs" color="primary" :icon="icon" :dropdown-icon="dIcon" :auto-close="false">
    <q-list :dense="$attrs.dense">
      <q-item clickable @click="onItemClick(option[optionValue])" v-for="option in options">
        <q-item-section>
          <q-item-label>{{ option[optionLabel] }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-checkbox color="primary" :model-value="selected.includes(option[optionValue])" @update:model-value="(v) => onItemClick(option[optionValue])"/>
        </q-item-section>
      </q-item>
    </q-list>
  </q-btn-dropdown>
</template>

<script setup>

import {computed, ref, watch} from "vue";

const props = defineProps({
  label: String,
  icon: String,
  options: Array,
  modelValue: Array,
  optionValue: {
    type: String,
    default: 'value'
  },
  optionLabel: {
    type: String,
    default: 'label'
  },
})

const emit = defineEmits(['update:modelValue'])

const icon = computed(() => (props.icon && props.label) ? props.icon : undefined)
const dIcon = computed(() => (props.icon && !props.label) ? props.icon : null)

const selected = ref([])
watch(() => props.modelValue, () => {
  selected.value = JSON.parse(JSON.stringify(props.modelValue))
}, {immediate: true, deep: true})

function onItemClick(v) {
  if (selected.value.includes(v)) {
    selected.value.splice(selected.value.indexOf(v), 1)
  } else {
    selected.value.push(v)
  }

  emit('update:modelValue', selected.value)
}
</script>

<style lang="scss" scoped>

</style>
