<template>
  <q-drawer
    side="right"
    v-model="modelValue"
    elevated
    :width="400"
    :breakpoint="500"
  >
    <q-toolbar style="position: fixed;z-index: 1;" class="bg-secondary text-white">
      <q-btn flat round dense icon="edit" @click="emit('edit')" v-if="editBtn"/>
      <q-space/>
      <span class="text-bold text-h6">{{ title }}</span>
      <q-space/>
      <q-btn flat round dense icon="close" @click="emit('update:modelValue', false)" />
    </q-toolbar>

    <q-scroll-area class="fit" style="padding-top: 50px">
      <div class="q-pa-sm">
        <slot/>
      </div>
    </q-scroll-area>
  </q-drawer>
</template>

<script setup>
defineProps({
  modelValue: { type: Boolean },
  title: { type: String },
  editBtn: { type: Boolean, default: false }
})
const emit = defineEmits(['update:modelValue', 'edit'])
</script>

<style lang="scss" scoped>

</style>
