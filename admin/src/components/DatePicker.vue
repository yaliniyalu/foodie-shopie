<template>
  <q-input :model-value="modelValue" v-bind="$attrs" readonly>
    <template v-slot:prepend>
      <q-icon name="event" class="cursor-pointer">
        <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
          <q-date :model-value="modelValue" @update:model-value="update" mask="YYYY-MM-DD">
            <div class="row items-center justify-end">
              <q-btn v-close-popup label="Close" color="primary" flat />
            </div>
          </q-date>
        </q-popup-proxy>
      </q-icon>
    </template>

    <template v-slot:append v-if="clearable && modelValue">
      <q-icon name="cancel" color="gray" @click="update(null)" class="cursor-pointer"/>
    </template>
  </q-input>
</template>

<script setup>
const props = defineProps({
  modelValue: { required: true },
  clearable: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue'])

function update(v) {
  emit('update:modelValue', v)
}
</script>

<style lang="scss" scoped>

</style>
