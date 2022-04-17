<template>
  <q-list bordered separator>
    <q-item>
      <q-item-section>
        <q-item-label>
          <div class="name q-pt-sm">{{ address.name }}</div>
          <div class="address q-pt-sm">
            <span>{{ address.street }}, </span>
            <span v-if="address.landmark">{{ address.landmark }}, </span>
            <span>{{ address.address_1 }}, </span>
            <span v-if="address.aaddress_2">{{ address.address_2 }}, </span>
            <span>{{ address.city }} - {{ address.pincode }}</span>
          </div>
          <div class="q-pt-sm text-bold" v-if="address.location">{{ address.location?.name }}</div>
          <div class="mobile q-pt-sm text-bold">+91 {{ address.phone }}</div>
        </q-item-label>
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script setup>
defineProps({
  address: Object
})
</script>

<style lang="scss" scoped>

</style>
