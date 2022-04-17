<template>
  <DrawerComponent :title="model?.name" :edit="model && `/item/${model?.id}/edit`">
    <SafeComponent :loading="loading" :model="model" :error="!model && !loading">
      <q-card flat bordered>
        <q-card-section>
          <div class="row q-col-gutter-sm">
            <div class="col-4">
              <swiper
                class="q-mt-sm"
                :space-between="5"
                :slides-per-view="1"
                :modules="[Pagination]"
              >
                <swiper-slide v-for="i in model.images">
                  <q-img class="img" :src="i.image" alt=""/>
                </swiper-slide>
              </swiper>
            </div>
            <div class="col-8">
              <div class="text-h6">{{ model.name }}</div>
              <div v-if="!model.isActive"><q-badge color="negative" label="disabled"/></div>
              <div class="text-grey">{{ model.category.name }}</div>
              <div class="q-gutter-sm">
                <q-badge color="info" :label="model.unit"/>
                <q-badge color="info" label="Pack" v-if="model.isPack"/>
              </div>
              <div class="q-mt-xs">{{ model.shortDescription }}</div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="q-mt-md">
        <q-card-section>
          <q-tabs
            v-model="descTab"
            dense
            class="text-grey"
            active-color="primary"
            indicator-color="primary"
            align="justify"
            narrow-indicator
          >
            <q-tab name="description" label="Description"/>
            <q-tab name="specification" label="Specification" />
          </q-tabs>
          <q-separator />
          <q-tab-panels v-model="descTab" animated>
            <q-tab-panel name="description">
              <div v-html="model.description"></div>
            </q-tab-panel>

            <q-tab-panel name="specification">
              <div v-html="model.specification"></div>
            </q-tab-panel>
          </q-tab-panels>
        </q-card-section>
      </q-card>

      <q-markup-table class="q-mt-md" flat bordered separator="cell" v-if="model.qtyPerSlice || model.minOrderQty || model.maxOrderQty">
       <thead>
       <tr>
         <th>Qty Per Slice</th>
         <th>Min. Order Qty</th>
         <th>Max. Order Qty</th>
       </tr>
       </thead>
        <tbody>
        <tr>
          <td class="font-mono text-center">{{model.qtyPerSlice ?? '-'}}</td>
          <td class="font-mono text-center">{{model.minOrderQty ?? '-'}}</td>
          <td class="font-mono text-center">{{model.maxOrderQty ?? '-'}}</td>
        </tr>
        </tbody>
      </q-markup-table>

      <q-markup-table class="q-mt-md" flat bordered separator="cell">
        <tbody>
        <tr>
          <th>Price</th>
          <td class="acc-number">{{model.price}}</td>
        </tr>
        </tbody>
      </q-markup-table>

      <q-card flat bordered class="q-mt-md">
        <q-card-section class="text-bold q-pa-sm">Discounts</q-card-section>

        <q-markup-table dense flat bordered separator="cell">
          <thead>
          <tr>
            <th>Normal</th>
            <th>Prime</th>
          </tr>
          </thead>
          <tbody>
          <tr class="text-center">
            <td>{{getDiscount('Normal')}}</td>
            <td>{{getDiscount('Prime')}}</td>
          </tr>
          </tbody>
        </q-markup-table>
      </q-card>

      <q-markup-table class="q-mt-md" flat bordered separator="cell">
        <thead>
        <tr>
          <th>Stock Keeping</th>
          <th>Stock</th>
          <th>Availability</th>
        </tr>
        </thead>
        <tbody>
        <tr class="text-center">
          <td>
            <q-badge color="info" :label="!model.maintainStock ? 'Disabled' : 'Enabled'"/>
          </td>
          <td>
            <div v-if="model.maintainStock" :class="model.stock < 10 ? 'text-negative' : 'text-positive'">{{ model.stock }}</div>
            <div v-else>-</div>
          </td>
          <td>
            <q-badge :color="model.isAvailable ? 'positive' : 'negative'" :label="model.isAvailable ? 'Available' : 'Unavailable'"/>
          </td>
        </tr>
        </tbody>
      </q-markup-table>

      <q-markup-table class="q-mt-md" flat bordered separator="cell">
        <thead>
        <tr>
          <th>Rating</th>
          <th>Reviews</th>
          <th>Purchased</th>
        </tr>
        </thead>
        <tbody>
        <tr class="text-center">
          <td><RatingStarBadge :value="model.rating" star/></td>
          <td>{{model.reviewCount}}</td>
          <td>{{model.purchaseCount}}</td>
        </tr>
        </tbody>
      </q-markup-table>

      <div class="q-gutter-md q-mt-md" v-if="!loading">
        <UserActionCard :user="model.createdBy" action="Created" :date="model.createdAt"/>
        <UserActionCard :user="model.updatedBy" action="Updated" :date="model.updatedAt" v-if="model.updatedBy"/>
      </div>
    </SafeComponent>
  </DrawerComponent>
</template>

<script setup>
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Pagination } from 'swiper';
import DrawerComponent from "components/DrawerComponent";
import SafeComponent from "components/SafeComponent";
import UserActionCard from "components/UserActionCard";
import {ref, watch} from "vue";
import {api} from "boot/axios";
import ui from "src/ui";
import {getDiscountStr} from "src/js/utils";
import RatingStarBadge from "components/badge/RatingStarBadge";

const props = defineProps({
  id: {
    type: [Number, String],
    required: true
  }
})
const emit = defineEmits(['update'])

const loading = ref();
const model = ref()

const descTab = ref('description')

watch(props, () => load(), {immediate: true})

async function load() {
  try {
    model.value = null
    loading.value = true
    const fields = ['id', 'name', 'purchaseCount', 'reviewCount', 'rating', 'isAvailable',
      'unit', 'isPack', 'shortDescription', 'qtyPerSlice', 'minOrderQty', 'maxOrderQty',
      'price', 'maintain_stock', 'stock', 'description', 'specification', 'isActive']
    const res = await api.get('/item/' + props.id + `?select=${fields.join(',')}&include=category:id,name;images;discounts;createdBy:id,name,email,phone,image;updatedBy:id,name,email,phone,image` )
    model.value = res.data.data.item
  } catch (e) {
    ui.notifyUnexpectedError()
  } finally {
    loading.value = false
  }
}

function getDiscount(member) {
  const discount = model.value.discounts.find(v => v.customerType === member)
  if (!discount) return '-'

  return getDiscountStr(discount.discountValue, discount.discountType)
}
</script>

<style lang="scss" scoped>

</style>
