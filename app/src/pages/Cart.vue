<template>
  <q-pull-to-refresh @refresh="refreshCart" ref="refresh" class="q-pa-sm">
    <q-page v-if="items.length">
      <q-card bordered flat class="q-mb-sm" clickable v-for="c in items" :key="c.id">
        <q-item :disable="!c.item.canPurchase">
          <q-item-section avatar top @click="openItem(c.item)">
            <q-avatar rounded>
              <img :src="getAssetsUrl(c.item.image)" alt="image">
            </q-avatar>
          </q-item-section>

          <q-item-section top @click="openItem(c.item)">
            <q-item-label lines="2">
              <span class="text-weight-medium">{{ c.item.name }}</span>
            </q-item-label>
            <q-item-label lines="1">
              {{ formatCurrency(c.item.price.price) }}<small class="text-grey" v-if="c.item.unit">/{{ c.item.unit }}</small><span v-if="c.item.price.oldPrice !== c.item.price.price">&nbsp;&nbsp;&nbsp;<span class="text-grey old-price">{{ formatCurrency(c.item.price.oldPrice) }}</span>
              &nbsp;&nbsp;&nbsp;<span class="text-positive" v-if="c.item.price.discountStr">{{ c.item.price.discountStr }} off</span></span>
            </q-item-label>
            <q-item-label caption lines="1" v-if="!c.item.canPurchase || (c.item.stock !== -1 && c.item.stock <= 10) || (c.item.stock !== -1 && c.qty > c.item.stock)">
              <span class="text-negative" v-if="c.item.errorReason">{{ c.item.errorReason }}</span>
              <span class="text-negative" v-else-if="c.item.stock > 0 && c.item.stock <= 10">Only {{c.item.stock}} available</span>
            </q-item-label>
            <q-item-label v-if="typeof c.item.deliverySlot === 'object'">
                Delivery: <span class="text-positive">{{ getDeliverySlotStr(c.item.deliverySlot) }}</span>
            </q-item-label>
          </q-item-section>
        </q-item>

        <q-card-section class="row q-pt-none q-pb-none" v-if="c.item.modifiers?.length">
          <q-select
            v-for="modifier in c.item.modifiers"
            outlined
            stack-label
            dense
            class="col-auto"
            :options="modifier.details"
            option-label="name"
            option-value="id"
            behavior="dialog"
            :label="modifier.group_name ?? undefined"
            :model-value="modifier.details.find(v => c.modifiers?.find(w => w.id === v.id))"
            :loading="modifierLoader[modifier.id]"
            @update:model-value="v => updateModifier(v, modifier, c)"
          />
        </q-card-section>

        <q-item :disable="!c.item.canPurchase">
          <q-item-section side>
            <q-btn color="secondary" flat size="md" padding="5px 4px" :loading="qtyLoader[c.id]" @click="openQtyDialog(c)" :disable="c.item.stock === -2">
              QTY: {{c.qty}} <small class="text-lowercase q-ml-xs" v-if="c.item.isPack === false">{{ c.item.unit }}</small>
            </q-btn>
          </q-item-section>
          <q-item-section class="float-right">
            <span class="text-bold text-right">{{ formatCurrency(c.totalAmount) }}</span>
          </q-item-section>
        </q-item>

        <q-separator/>

        <q-card-actions align="evenly">
          <q-btn flat color="negative" label="Delete" icon="fas fa-trash" size="sm" :loading="removeLoader[c.id]" @click="deleteItem(c)"/>
          <q-btn flat color="primary" label="Move to wishlist" icon="fas fa-heart" size="sm" :loading="moveLoader[c.id]" @click="moveItem(c)"/>
        </q-card-actions>
      </q-card>

      <CurrentLocation bordered flat class="q-mb-sm"/>

      <q-card bordered flat v-if="items.length">
        <q-card-section>
          <div class="text-h6">Price Details</div>
        </q-card-section>

        <q-separator/>

        <q-card-section>
          <q-markup-table dense class="price-details" flat separator="none">
            <tbody>
            <tr>
              <th class="text-left">Sub total</th>
              <td class="text-right">{{ formatCurrency(pricing.subTotal) }}</td>
            </tr>
            <tr v-if="pricing.totalDiscount">
              <th class="text-left">Discount</th>
              <td class="text-right">- {{ formatCurrency(pricing.totalDiscount) }}</td>
            </tr>
            <tr>
              <th class="text-left">Delivery Charge</th>
              <td v-if="pricing.deliveryCharge === 0" class="text-positive text-right">Free</td>
              <td class="text-right" v-if="pricing.deliveryCharge">{{ formatCurrency(pricing.deliveryCharge) }}</td>
            </tr>
            <tr class="tr-total" style="border-top: 1px solid #ccc">
              <th class="text-left text-bold" style="font-size: 1.2em">Total</th>
              <td class="text-right text-bold" style="font-size: 1.2em">{{ formatCurrency(pricing.grandTotal) }}</td>
            </tr>
            </tbody>
          </q-markup-table>
        </q-card-section>
        <q-separator/>
        <q-card-section class="text-center" v-if="pricing.totalDiscount > 0">
          <span class="text-positive text-bold">You save {{ formatCurrency(pricing.totalDiscount) }} in this order</span>
        </q-card-section>

        <q-card-actions align="center">
          <q-btn color="primary" unelevated label="Checkout" style="width: 100%" @click="checkoutOrder"/>
        </q-card-actions>
      </q-card>

      <div class="put-in-center text-center q-pa-lg" v-if="!items.length">
        <p class="text-grey text-center">Your cart is empty.<br/>Please add items to see it here.</p>
        <q-btn color="primary" flat label="Shop Now" to="/items"/>
      </div>
    </q-page>
    <q-page class="flex flex-center" v-else>
      <div class="flex flex-center column q-pa-lg" v-if="!items.length && !loading">
        <p class="text-grey text-center">Your cart is empty.<br/>Please add items to see it here.</p>
        <q-btn color="primary" flat label="Add Items" to="/items"/>
      </div>

      <div class="flex flex-center column q-pa-lg" v-if="!items.length && loading">
        <p class="text-grey text-center">Loading... Please wait...</p>
      </div>
    </q-page>
  </q-pull-to-refresh>
</template>

<script setup>
import {computed, onMounted, reactive, ref} from "vue";
import {useRouter} from "vue-router";
import {useQuasar} from "quasar";
import {useStore} from "vuex";
import ui from "src/ui";
import {calculateTotal, formatCurrency, getAssetsUrl, formatSlotTime, getDeliverySlotStr} from "src/js/utils";
import QtySelectorDialog from "components/dialogs/QtySelectorDialog";
import CurrentLocation from "components/CurrentLocation";
import {useNavbar} from "src/composables/navbar";

const router = useRouter()
const store = useStore()
const quasar = useQuasar()

const removeLoader = reactive({})
const moveLoader = reactive({})
const qtyLoader = reactive({})
const modifierLoader = reactive({})

/** @type ComputedRef<Array<ICartItem>>*/
const items = computed(() => store.state.cart.items)

/** @type ComputedRef<Array<ICartItem>>*/
const purchasableItems = computed(() => items.value.filter(v => v.item.canPurchase && (v.item.stock === -1 || v.qty <= v.item.stock)))

/** @type ComputedRef<ICartTotal>*/
const pricing = computed(() => calculateTotal(purchasableItems.value, {deliveryCharge: store.state.cart.deliveryLocation.fee}))

const loading = ref(false)

useNavbar('back', "My Cart")

onMounted(() => {
  store.dispatch('cart/fetchCart')
})

function openItem(item) {
  router.push('/item/' + item.id)
}

async function openQtyDialog(item) {
  quasar.dialog({
    component: QtySelectorDialog,
    componentProps: {
      qty: item.qty,
      isInteger: !!item.item.isPack,
      max: Math.max(item.item.stock === -1 ? null : item.item.stock, item.item.maxOrderQty ? parseFloat(item.item.maxOrderQty) : null),
      min: item.item.minOrderQty ? parseFloat(item.item.minOrderQty) : null,
      increment: item.item.qtyPerSlice ? parseFloat(item.item.qtyPerSlice) : null,
    }
  }).onOk(async (qty) => {
    await setQty(item, qty)
  })
}

async function setQty(cartItem, qty) {
  qtyLoader[cartItem.id] = true

  try {
    await store.dispatch('cart/addItem', {item: cartItem.item, qty, isUpdate: true})
  } catch {
    ui.notifyUnexpectedError();
  } finally {
    qtyLoader[cartItem.id] = false
  }
}

async function updateModifier(v, modifier, cartItem) {
  modifierLoader[modifier.id] = true

  try {
    await store.dispatch('cart/patchItem', {id: cartItem.id, modifiers: [v.id]})
  } catch {
    ui.notifyUnexpectedError();
  } finally {
    modifierLoader[modifier.id] = false
  }
}

async function deleteItem(cartItem) {
  removeLoader[cartItem.id] = true
  try {
    await store.dispatch('cart/deleteItem', {id: cartItem.id})
    ui.toast("Item deleted")
  } catch {
    ui.notifyUnexpectedError();
  } finally {
    removeLoader[cartItem.id] = false
  }
}

async function moveItem(cartItem) {
  moveLoader[cartItem.id] = true
  try {
    await store.dispatch('cart/moveToSaveLater', {id: cartItem.id})
    ui.toast("Item moved")
  } catch {
    ui.notifyUnexpectedError();
  } finally {
    moveLoader[cartItem.id] = false
  }
}

async function refreshCart(done) {
  try {
    loading.value = true
    await store.dispatch('cart/fetchCart')
  } catch (e) {
    ui.notifyUnexpectedError();
  } finally {
    loading.value = false
    done();
  }
}

async function checkoutOrder() {
  await processCheckoutOrder()
}

async function processCheckoutOrder() {
  loading.value = true
  try {
    await store.dispatch("cart/resetOrderDetails")
    await store.dispatch("cart/setOrderDetails", {type: "items", value: purchasableItems.value})
    const res = await store.dispatch("cart/tryLoadingDefaultAddress")
    if (res) {
      await router.push("/checkout/summary")
    } else {
      await router.push("/checkout/address")
    }
  } catch (e) {
    ui.notifyUnexpectedError()
  }
  loading.value = false
}

</script>

<style lang="scss" scoped>

</style>
