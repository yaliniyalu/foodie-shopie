<template>
  <DrawerComponent :title="model?.code" :edit="model && `/coupon/${model?.id}/edit`">
    <SafeComponent :loading="loading" :model="model" :error="!model && !loading">
      <q-list bordered separator>
        <q-item clickable v-ripple>
          <q-item-section>
            <q-item-label class="font-mono">{{model.code}}</q-item-label>
            <q-item-label caption>Promo Code</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple>
          <q-item-section>
            <q-item-label>
              <StatusBadge :options="CustomerTypes" :value="model.customerType"/>
            </q-item-label>
            <q-item-label caption>Customers</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple>
          <q-item-section>
            <q-item-label class="font-mono">{{getDiscountStr(model.discountValue, model.discountType)}}</q-item-label>
            <q-item-label caption>Discount</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple>
          <q-item-section>
            <q-item-label class="font-mono">{{model.minOrderValue || '-'}}</q-item-label>
            <q-item-label caption>Minimum Order Value</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple>
          <q-item-section>
            <q-item-label class="font-mono">{{model.maxDiscountValue || '-'}}</q-item-label>
            <q-item-label caption>Maximum Discount Value</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple>
          <q-item-section>
            <q-item-label v-if="model.expiresOn" :class="isExpired ? 'text-red' : 'text-green'">
              {{humanDateTime(model.expiresOn)}} <span class="text-grey">({{timeAgo(model.expiresOn)}})</span>
            </q-item-label>
            <q-item-label v-else>-</q-item-label>
            <q-item-label caption>Expiry</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>

      <div class="q-mt-md flex flex-center" v-if="!isExpired">
        <DropdownButton :options="ActiveStatus" :value="model.isActive" :change="updateStatus"/>
      </div>

      <div class="q-mt-md">
        <q-separator/>
        <div class="q-gutter-md q-mt-md" v-if="!loading">
          <UserActionCard :user="model.createdBy" action="Created" :date="model.createdAt"/>
          <UserActionCard :user="model.updatedBy" action="Updated" :date="model.updatedAt" v-if="model.updatedBy"/>
        </div>
      </div>

      <div class="q-mt-md">
        <q-separator/>
        <div class="q-mt-md flex flex-center">
          <q-btn flat label="view claims" color="primary" @click="claimsDialog = true"/>
        </div>
      </div>

      <q-dialog v-model="claimsDialog">
        <q-card style="width: 500px">
          <q-card-section class="flex text-h6">
            Coupons Claimed
            <q-space/>
            <q-btn color="primary" flat round icon="close" v-close-popup/>
          </q-card-section>
          <q-separator/>
          <q-card-section>
            <q-list bordered separator>
              <q-item>
                <q-item-section>
                  <q-item-label class="font-mono">{{ model.orders.length }}</q-item-label>
                  <q-item-label caption>Total Claims</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label class="font-mono">{{ model.orders.reduce((a, v) => a + parseFloat(v.amountPromotion), 0) }}</q-item-label>
                  <q-item-label caption>Claimed Amount</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
          <q-separator/>
          <q-card-section>
            <q-list>
              <q-item clickable v-ripple v-for="claim in model.orders">
                <q-item-section>
                  <q-item-label>{{ claim.customer.name || claim.customer.phone }}</q-item-label>
                  <q-item-label class="font-mono" caption>₹{{ claim.amountPromotion }}</q-item-label>
                </q-item-section>
                <q-item-section class="flex" style="flex-direction: row" side>
                  <q-btn color="primary" flat round icon="shopping_cart" :to="'/order/' + claim.id"/>
                  <q-btn color="primary" flat round icon="person" :to="'/customer/' + claim.customer.id"/>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </q-dialog>
    </SafeComponent>
  </DrawerComponent>
</template>

<script setup>
import {computed, ref, watch} from "vue";
import {api} from "boot/axios";
import ui from "src/ui";
import SafeComponent from "components/SafeComponent";
import UserActionCard from "components/UserActionCard";
import DrawerComponent from "components/DrawerComponent";
import {getDiscountStr, humanDateTime, timeAgo} from "src/js/utils";
import { date } from 'quasar'
import DropdownButton from "components/DropdownButton";
import {ActiveStatus, CustomerTypes} from "src/js/model-helpers/coupons";
import StatusBadge from "components/badge/StatusBadge";

const props = defineProps({
  id: {
    type: [Number, String],
    required: true
  }
})
const emit = defineEmits(['update'])

const loading = ref();
const model = ref()
const claims = ref([])
const claimsDialog = ref(false)

const isExpired = computed(() => {
  if (!model || !model.expiresOn) return false

  const diff = date.getDateDiff(new Date(model.expiresOn), new Date(), 'hours')

  return diff <= 0
})

watch(props, () => props.id && load(), {immediate: true})

async function load() {
  try {
    model.value = null
    loading.value = true
    const includes = {
      createdBy: ['id', 'name', 'email', 'phone', 'image'],
      updatedBy: ['id', 'name', 'email', 'phone', 'image'],
      orders: ['id', 'amountPromotion'],
      'orders.customer': ['id', 'name', 'phone']
    }

    const inc = Object.keys(includes).map(i => includes[i] === true ? i : (i + ':' + includes[i].join(','))).join(';')
    const res = await api.get('/coupon/' + props.id + `?include=` + inc)
    model.value = res.data.data.coupon
  } catch (e) {
    ui.notifyUnexpectedError()
  } finally {
    loading.value = false
  }
}

const updatingStatus = ref()

async function updateStatus(status) {
  try {
    updatingStatus.value = true
    const res = await api.patch('/coupon/' + props.id, { isActive: status.value })
    await load()
    emit('update', model.value)
  } catch (e) {
    ui.notifyUnexpectedError()
  } finally {
    updatingStatus.value = false
  }
}

</script>

<style lang="scss" scoped>

</style>
