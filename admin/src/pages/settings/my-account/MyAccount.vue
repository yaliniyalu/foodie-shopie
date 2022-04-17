<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md">
      <MyAccountEdit/>
      <MyAccountPassword/>
<!--      <MyAccountLocations/>-->
    </div>
  </q-page>
</template>

<script setup>
import MyAccountEdit from "pages/settings/my-account/components/MyAccountEdit";
import MyAccountPassword from "pages/settings/my-account/components/MyAccountPassword";
import MyAccountLocations from "pages/settings/my-account/components/MyAccountLocations";
</script>

<style lang="scss" scoped>

</style>
