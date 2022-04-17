<template>
  <q-toolbar style="position: fixed;z-index: 1;" :class="['bg-' + color, 'text-white']">
    <q-btn flat round dense icon="edit" :to="{path: edit}" v-if="edit"/>
    <q-space/>
    <span class="text-bold text-h6">{{ title }}</span>
    <q-space/>
    <q-btn flat round dense icon="close" @click="router.back()" />
  </q-toolbar>

  <q-scroll-area class="fit" style="padding-top: 50px">
    <div class="q-pa-sm">
      <slot/>
    </div>
  </q-scroll-area>
</template>

<script setup>
import {useRouter} from "vue-router";

const props = defineProps({
  title: { type: String },
  edit: { type: String, default: null },
  color: { type: String, default: 'secondary' }
})

const router = useRouter()
</script>

<style lang="scss" scoped>

</style>
