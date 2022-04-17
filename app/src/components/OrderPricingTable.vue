<template>
  <q-card flat bordered>
    <q-card-section>
      <q-markup-table dense class="price-details" flat separator="none">
        <tbody>
        <tr>
          <th class="text-left">Sub total</th>
          <td class="text-right">{{ formatCurrency(pricing.subTotal) }}</td>
        </tr>
        <tr v-if="pricing.totalDiscount">
          <th class="text-left">Discount</th>
          <td class="text-right text-positive">- {{ formatCurrency(pricing.totalDiscount) }}</td>
        </tr>
        <tr>
          <th class="text-left">Delivery</th>
          <td v-if="pricing.deliveryCharge === 0" class="text-positive text-right">Free</td>
          <td class="text-right" v-if="pricing.deliveryCharge"><span v-if="pricing.deliveryTrip > 1">{{ pricing.deliveryTrip }} x </span>{{ formatCurrency(pricing.deliveryCharge) }}</td>
        </tr>
        <tr v-if="pricing.couponDiscount">
          <th class="text-left">Promotional</th>
          <td class="text-right text-positive">-{{ formatCurrency(pricing.couponDiscount) }}</td>
        </tr>
        <tr class="tr-total" style="border-top: 1px solid #ccc">
          <th class="text-left text-bold" style="font-size: 1.2em">Total</th>
          <td class="text-right text-bold" style="font-size: 1.2em">{{ formatCurrency(pricing.grandTotal) }}</td>
        </tr>
        </tbody>
      </q-markup-table>
    </q-card-section>
  </q-card>
</template>

<script setup>
import {formatCurrency} from "src/js/utils";

defineProps({
  pricing: { type: Object, required: true }
})
</script>

<style lang="scss" scoped>

</style>
