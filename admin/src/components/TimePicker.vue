<template>
  <q-input :model-value="displayValue" v-bind="$attrs" readonly>
    <template v-slot:append>
      <q-icon name="access_time" class="cursor-pointer">
        <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
          <q-time :model-value="modelValue" @update:model-value="update" mask="HH:mm">
            <div class="row items-center justify-end">
              <q-btn v-close-popup label="Close" color="primary" flat />
            </div>
          </q-time>
        </q-popup-proxy>
      </q-icon>
    </template>
  </q-input>
</template>

<script setup>
import {computed} from "vue";
import {humanTime} from "src/js/utils";

const props = defineProps({
  modelValue: { required: true }
})

const emit = defineEmits(['update:modelValue'])

const displayValue = computed(() => {
  if (!props.modelValue) return '';
  return humanTime((new Date).toISOString().split('T')[0] + ' ' + props.modelValue)
})

function update(v) {
  emit('update:modelValue', v)
}
</script>

<style lang="scss" scoped>

</style>
