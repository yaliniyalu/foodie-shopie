<template>
  <q-card :bordered="bordered" :flat="flat">
    <q-card-section>
      <div class="flex justify-between items-center">
        <q-skeleton width="80%" />
        <q-skeleton width="19%" />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
defineProps({
  bordered: Boolean,
  flat: Boolean
})
</script>

<style lang="scss" scoped>

</style>
