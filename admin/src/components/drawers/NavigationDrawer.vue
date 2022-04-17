<template>
  <q-drawer
    side="right"
    v-model="open"
    elevated
    :width="400"
    :breakpoint="500"
  >
    <router-view v-bind="$attrs" v-if="open"/>
  </q-drawer>
</template>

<script setup>
import {useRoute, useRouter} from "vue-router";
import {ref, watch} from "vue";

const props = defineProps({
  path: { type: [Array, String] }
})

const route = useRoute()

const open = ref(false)

watch(route, checkDrawerStatus, {immediate: true})

function checkDrawerStatus() {
  if (typeof props.path === "string") {
    open.value = !!route.matched.find(m => m.path === props.path);
  } else {
    open.value = !!props.path.find(r => route.matched.findIndex(m => m.path === r) >= 0)
  }
}
</script>

<style lang="scss" scoped>

</style>
