<template>
<q-page class="q-pa-md">
  <div class="row q-col-gutter-md ">
    <div class="col-6"><SettingsContact/></div>
    <div class="col-6"><SettingsPayment/></div>
  </div>
  <div class="row q-col-gutter-md q-mt-sm">
    <div class="col-6"><SettingsTermsPage page-type="terms"/></div>
    <div class="col-6"><SettingsTermsPage page-type="privacy"/></div>
  </div>
</q-page>
</template>

<script setup>
import SettingsContact from "pages/settings/other-settings/components/SettingsContact";
import SettingsTermsPage from "pages/settings/other-settings/components/SettingsTermsPage";
import SettingsPayment from "pages/settings/other-settings/components/SettingsPayment";
</script>

<style lang="scss" scoped>

</style>
