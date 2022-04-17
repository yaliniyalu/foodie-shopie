<template>
  <div class="row">
    <div class="col text-center flex flex-center column">
      <div class="text-h5"><q-skeleton width="50px"/></div>
      <q-skeleton class="q-mt-sm" width="80px" type="text"/>>
    </div>
    <q-separator vertical/>
    <div class="col q-pa-md">
      <div class="q-mt-xs flex items-center no-wrap" v-for="r in 5">
        <q-skeleton class="q-mr-sm" type="text" width="20px"/>
        <q-skeleton style="width: 100%" type="text"/>
        <q-skeleton class="q-ml-sm" type="text" width="25px"/>
      </div>
    </div>
  </div>
</template>

<script setup>

</script>

<style lang="scss" scoped>

</style>
