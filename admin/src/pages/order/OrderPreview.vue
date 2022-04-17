<template>
  <DrawerComponent :title="model ? '#' + model.id : ''">
    <SafeComponent :loading="loading" :model="model" :error="!model && !loading">

      <q-card flat bordered>
        <q-card-section class="text-center">
          <div>{{ humanDateTime(model.createdAt) }}&nbsp; <span class="text-grey">({{ timeAgo(model.createdAt) }})</span></div>
        </q-card-section>
      </q-card>

      <q-card class="q-mt-md" flat bordered v-if="canI.updateOrderStatus && statusBtn">
        <q-card-section class="flex justify-around">
          <q-btn unelevated :color="statusBtn.color" :label="statusBtn.label" @click="changeStatus" :loading="changingStatus"/>
        </q-card-section>
      </q-card>

      <div class="q-mt-md" v-if="model.assignedTo">
        <p class="q-mb-xs text-bold">Assigned To</p>
        <q-list flat bordered>
          <q-item>
            <q-item-section avatar>
              <q-avatar>
                <img :src="model.assignedTo.image" alt="">
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label>{{model.assignedTo.name}}</q-item-label>
              <q-item-label caption>{{model.assignedTo.email}}</q-item-label>
                            <q-item-label caption>{{model.phone}}</q-item-label>
<!--              <q-item-label><q-badge color="primary" :label="model.assignedTo.type"/></q-item-label>-->
            </q-item-section>
            <q-item-section side v-if="canI.unAssignUser">
              <q-btn flat round color="negative" icon="person_remove" @click.stop="removeAssigned" :loading="removingAssigned"/>
            </q-item-section>
          </q-item>
        </q-list>
      </div>
      <div class="q-mt-md flex justify-around" v-else-if="canOrderAssigned">
        <q-btn unelevated color="blue" label="Assign Me" @click="assignUser('me')" :loading="assigningMe"/>
        <q-btn unelevated color="cyan" label="Assign Other" @click="assignSelectRef.showPopup()" v-if="canI.assignUser" :loading="assigningOther"/>
      </div>

      <div class="q-mt-md">
        <p class="q-mb-xs text-bold">Customer</p>
        <CustomerCard :customer="model.customer"/>
      </div>

      <div class="q-mt-md">
        <p class="q-mb-xs text-bold">Delivery Address</p>
        <AddressCard :address="model.address"/>
      </div>

      <div class="q-mt-md">
        <div class="text-right" v-if="canI.processItem">
          <q-btn flat round :color="isCheckListMode ? 'warning': 'positive'" :icon="isCheckListMode ? 'visibility': 'edit'" @click="isCheckListMode = !isCheckListMode"/>
        </div>

        <q-list bordered separator v-if="!isCheckListMode">
          <q-expansion-item v-for="item in orderItems">
            <template v-slot:header>
              <q-item-section avatar>
                <q-avatar>
                  <img :src="getImage(item)" alt="image">
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label :class="['text-' + getItemStatusColor(item.status)]">{{ item.itemName }}</q-item-label>
                <q-item-label caption>{{ formatCurrency(item.price) }}</q-item-label>
              </q-item-section>
              <q-item-section top>
                <q-item-label class="acc-number"><q-badge color="light-blue">{{ item.qty }}</q-badge></q-item-label>
                <q-item-label class="font-mono text-right">{{ formatCurrency(item.amount) }}</q-item-label>
              </q-item-section>
            </template>

            <q-list dense bordered separator class="q-ml-md q-mr-md q-mb-sm q-mt-sm">
              <q-item dense>
                <q-item-section>
                  <q-item-label>{{ item.item.category.name }}</q-item-label>
                  <q-item-label caption>Category</q-item-label>
                </q-item-section>
              </q-item>
              <q-item dense>
                <q-item-section>
                  <q-item-label>{{ formatCurrency(item.price) }}</q-item-label>
                  <q-item-label caption>Selling Price</q-item-label>
                </q-item-section>
              </q-item>
              <q-item dense>
                <q-item-section>
                  <q-item-label>{{ item.discount ?? '-' }}</q-item-label>
                  <q-item-label caption>Discount</q-item-label>
                </q-item-section>
              </q-item>
              <q-item dense v-if="canI.showItemStatus">
                <q-item-section>
                  <q-item-label><StatusBadge :options="OrderItemStatus" :value="item.status"/></q-item-label>
                  <q-item-label caption>Status</q-item-label>
                </q-item-section>
              </q-item>
              <q-item v-if="canI.cancelItem">
                <q-item-section>
                  <q-btn color="negative" flat label="Cancel" @click="changeItemStatus('Cancelled', item.id, item.item_name)" :loading="changingItemStatus[item.id]"/>
                </q-item-section>
              </q-item>
            </q-list>
          </q-expansion-item>
        </q-list>
        <q-list bordered separator v-else>
          <q-item v-for="item in orderItems">
            <q-item-section avatar>
              <q-avatar>
                <img :src="getImage(item)" alt="image">
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label :class="['text-' + getItemStatusColor(item.status)]">{{ item.itemName }}</q-item-label>
              <q-item-label caption class="font-mono"><q-badge color="light-blue">{{ item.qty }}</q-badge></q-item-label>
              <q-item-label caption class="font-mono">{{ formatCurrency(item.amount) }}</q-item-label>
            </q-item-section>

            <q-item-section side>
              <q-btn icon="check" color="positive" flat round v-if="item.status === 'Pending'" @click="changeItemStatus('Processed', item.id)" :loading="changingItemStatus[item.id]"/>
              <q-btn icon="close" color="negative" flat round v-if="item.status === 'Processed'" @click="changeItemStatus('Pending', item.id)" :loading="changingItemStatus[item.id]"/>
            </q-item-section>
          </q-item>
        </q-list>
      </div>

      <q-list separator bordered class="q-mt-md" v-if="model.coupons?.length">
        <q-item dense><q-item-section class="text-grey">Coupon Applied</q-item-section></q-item>
        <q-item clickable v-ripple :to="'/coupon/' + model.coupons[0].coupon.id">
          <q-item-section>
            <q-item-label>{{ model.coupons[0].coupon.code }}</q-item-label>
            <q-item-label caption class="text-green">{{ model.coupons[0].discount}} off</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>

      <q-list separator bordered class="q-mt-md">
        <q-item dense><q-item-section class="text-grey">Amount</q-item-section></q-item>
        <q-item v-for="payment in PaymentLabels" :class="[payment.bold ? 'text-bold' : '']">
          <q-item-section>
            <q-item-label>{{ payment.label }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <span :class="['text-' + payment.color, 'acc-number']"><span v-if="payment.minus">-&nbsp;</span>{{ formatCurrency(model[payment.name]) }}</span>
          </q-item-section>
        </q-item>
        <q-item dense><q-item-section class="text-grey">Payment</q-item-section></q-item>
        <q-item>
          <q-item-section>
            <q-item-label>Paid</q-item-label>
          </q-item-section>
          <q-item-section side>
            <span class="text-green acc-number">{{ formatCurrency(model.amountPaid) }}</span>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>Refunded</q-item-label>
          </q-item-section>
          <q-item-section side>
            <span class="text-red acc-number">- {{ formatCurrency(model.amountRefunded) }}</span>
          </q-item-section>
        </q-item>
        <q-item class="text-bold">
          <q-item-section>
            <q-item-label>Balance</q-item-label>
          </q-item-section>
          <q-item-section side>
            <span :class="['text-' + getBalanceColor(model.amountBalance < 0), 'acc-number']">{{ model.amountBalance < 0 ? '' : '' }} {{ formatCurrency(model.amountBalance) }}</span>
          </q-item-section>
        </q-item>
      </q-list>

      <q-card class="q-mt-md" flat bordered v-if="canI.payAmount || canI.refundAmount">
        <q-card-section class="text-center flex items-center justify-evenly">
          <q-btn-dropdown unelevated :color="canI.payAmount ? 'positive' : 'accent'" :label="canI.payAmount ? 'Pay Balance' : 'Refund Balance'" v-if="canI.payAmount || canI.refundAmount">
            <q-list>
              <q-item clickable v-close-popup @click="openPayment('Cash')">
                <q-item-section>
                  <q-item-label>Cash</q-item-label>
                </q-item-section>
              </q-item>

              <q-item clickable v-close-popup @click="openPayment('UPI')">
                <q-item-section>
                  <q-item-label>UPI</q-item-label>
                </q-item-section>
              </q-item>

              <q-item clickable v-close-popup @click="openPayment('RazorPay')">
                <q-item-section>
                  <q-item-label>RazorPay</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>

          <q-btn flat color="primary" label="View RazorPay" @click="openRazorPay" v-if="model.razorpayOrderId"/>
        </q-card-section>
      </q-card>

      <q-card class="q-mt-md" flat v-if="canI.cancelOrder">
        <q-card-section class="flex justify-around">
          <q-btn unelevated color="negative" label="Cancel Order" @click="cancelOrder" :loading="cancellingOrder"/>
        </q-card-section>
      </q-card>

      <q-list class="q-mt-md" bordered separator v-if="model.paymentLogs?.length">
        <q-item dense><q-item-section class="text-grey">Payment Logs</q-item-section></q-item>
        <q-item v-for="log in model.paymentLogs">
          <q-item-section>
            <q-item-label>{{ log.method }}</q-item-label>
            <q-item-label caption>{{ log.createdBy?.name }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-item-label :class="`font-mono ` + (log.type === 'Credit' ? 'text-positive' : 'text-negative')">
              {{log.type === 'Debit' ? '- ' : ''}}{{ formatCurrency(log.amount) }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>

    </SafeComponent>
  </DrawerComponent>
  <SelectAccount ref="assignSelectRef" class="hidden" outlined stack-label emit-value map-options behavior="dialog" model-value="" @update:model-value="assignUser" input-class="input-class-is" popup-content-class="popup-class-is"/>
</template>

<script setup>
import DrawerComponent from "components/DrawerComponent";
import SafeComponent from "components/SafeComponent";
import {computed, reactive, ref, watch} from "vue";
import {api} from "boot/axios";
import ui from "src/ui";
import StatusBadge from "components/badge/StatusBadge";
import {OrderStatus, OrderItemStatus} from "src/js/model-helpers/orders";
import {useStore} from "vuex";
import CustomerCard from "components/cards/CustomerCard";
import {formatCurrency, humanTime, isToday, isTomorrow} from "src/js/utils";
import AddressCard from "components/cards/AddressCard";
import {humanDateTime, timeAgo} from "src/js/utils";
import SelectAccount from "components/select/SelectAccount";
import {useQuasar} from "quasar";
import PaymentDialog from "pages/order/components/PaymentDialog";

const props = defineProps({
  id: {
    type: [Number, String],
    required: true
  }
})
const emit = defineEmits(['update'])

const store = useStore()
const quasar = useQuasar()

const loading = ref()
const paying = ref()
const model = ref()

const me = store.state.app.user;
const canIEdit = computed(() => me.id === model.value?.assignedTo?.id)
const mayIEdit = computed(() => canIEdit.value || true)
const amIAdmin = computed(() => true)
const isAssigned = computed(() => !!model.value?.assigned_to?.id)

const isCheckListMode = ref(false)
const orderItems = ref([])

const isOrder = (status) => {
  if (typeof status === "string") {
    status = [status]
  }
  return status.includes(model.value?.status)
}

const isAllItemsProcessed = computed(() => orderItems.value.find(v => v.status === 'Pending') === undefined)

const canOrderAssigned = computed(() => !isAssigned.value && !isOrder(['Waiting']))

/**
 * WARNING:
 * If you change anything below you also have to change in deliver app && api.
 * Permissions for api, admin panel & delivery app are not same they differ slightly.
 */
const canI = computed(() => ({
  assignMe:   canOrderAssigned.value && (amIAdmin.value || isOrder(['Pending'])) ,
  assignUser: canOrderAssigned.value && amIAdmin.value,
  unAssignUser: (isOrder(['Pending']) && canIEdit.value) || amIAdmin.value,

  updateOrderStatus: !isOrder(['Waiting', 'Cancelled', 'Delivered']) && canIEdit.value,
  processOrder:   isOrder(['Pending'])    && canIEdit.value,
  processedOrder: isOrder(['Processing']) && canIEdit.value && isAllItemsProcessed.value,
  deliveredOrder: isOrder(['Dispatched']) && canIEdit.value,
  cancelOrder:    !isOrder(['Cancelled', 'Delivered']) && canIEdit.value,

  payAmount:    model.value?.amountBalance > 0 && mayIEdit.value, // may
  refundAmount: model.value?.amountBalance < 0 && mayIEdit.value, // may

  showItemStatus: !isOrder(['Cancelled', 'Waiting']),
  processItem:     isOrder(['Processing']) && canIEdit.value,
  cancelItem:      isOrder(['Processing']) && canIEdit.value,
}))

const coupons = computed(() => model.value ? model.value.coupons.filter(v => v.isActive) : [])

watch(isCheckListMode, (v) => !v ? sortOrderItems() : '')

function sortOrderItems() {
  orderItems.value = model.value?.details.sort((a, b) => {
    if (a.status === 'Pending' || b.status === 'Cancelled') {
      return -1;
    }

    if (a.status === 'Cancelled' || b.status === 'Pending') {
      return 1
    }

    return 0;
  })
}

watch(props, () => props.id && load(), {immediate: true})

function getImage(detail) {
  return detail.item.images?.find(v => v.isDefault)?.image
}

async function load() {
  try {
    model.value = null
    loading.value = true
    isCheckListMode.value = false

    const includes = {
      customer: ['id', 'name', 'customerType', 'phone'],
      assignedTo: ['id', 'name', 'email', 'image'],
      address: true,
      details: true,
      coupon: true,
      'details.item': ['id', 'unit'],
      'details.item.category': ['id', 'name'],
      'details.item.images': ['image', 'isDefault'],
      'coupons.coupon': ['id', 'code'],
      'address.location': ['id', 'name', 'pincode', 'lat', 'lng'],
      'paymentLogs': true,
      'paymentLogs.createdBy': ['id', 'name']
    }

    const inc = Object.keys(includes).map(i => includes[i] === true ? i : (i + ':' + includes[i].join(','))).join(';')

    const res = await api.get('/order/' + props.id + `?include=` + inc)
    model.value = res.data.data.order
    sortOrderItems()
  } catch (e) {
    ui.notifyUnexpectedError()
  } finally {
    loading.value = false
  }
}

const PaymentLabels = [
  { name: 'amountItems',     label: 'Total Items',    color: 'dark', minus: false},
  { name: 'amountDiscount',  label: 'Total Discount', color: 'red', minus: true},
  { name: 'amountDelivery',  label: 'Delivery',       color: 'dark', minus: false},
  { name: 'amountPromotion', label: 'Promotion',      color: 'red', minus: true},
  { name: 'amountTotal',     label: 'Grand Total',    color: 'green', minus: false, bold: true},
]

function getItemStatusColor(status) {
  console.log(status)
  if (!canI.value.showItemStatus) return 'dark'
  return OrderItemStatus.find(v => v.value === status).color
}

function getBalanceColor(balance) {
  if (balance < 0) {
    return 'red'
  } else if (balance > 0) {
    return  'purple'
  } else {
    return 'green'
  }
}

const removingAssigned = ref(false)
async function removeAssigned() {
  removingAssigned.value = true
  try {
    await api.delete('order/' + props.id + '/assigned')
    model.value.assignedTo = null
    ui.notifySuccess("User removed from order")
  } catch (e) {
    ui.notifyUnexpectedError()
  } finally {
    removingAssigned.value = false
  }
}

const assigningMe = ref(false)
const assigningOther = ref(false)
const assignSelectRef = ref()
async function assignUser(val) {
  val === 'me' ? assigningMe.value = true : assigningOther.value = true
  try {
    await api.patch('order/' + props.id + '/assign/' + val)
    ui.notifySuccess("Order Assigned")
    await load()
  } catch (e) {
    ui.notifyUnexpectedError()
  } finally {
    assigningMe.value = false
    assigningOther.value = false
  }
}

const changingStatus = ref(false)
const statusBtn = computed(() => {
  switch (model.value.status) {
    case 'Pending':
      return {
        ...OrderStatus.find(v => v.value === 'Processing'),
        action: 'Process',
        label: 'Process Order',
        confirm: 'Do you want to process this Order?',
      }
    case 'Processing':
      return {
        ...OrderStatus.find(v => v.value === 'Processed'),
        action: 'Processed',
        label: 'Order Processed',
        confirm: 'Do you want to mark this order as processed?',
      }
    case 'Processed':
      return {
        ...OrderStatus.find(v => v.value === 'Dispatched'),
        action: 'Dispatched',
        label: 'Order Dispatched',
        confirm: 'Do you want to mark this order as dispatched?',
      }
    case 'Dispatched':
      return {
        ...OrderStatus.find(v => v.value === 'Delivered'),
        action: 'Delivered',
        label: 'Order Delivered',
        confirm: 'Do you want to mark this order as delivered?',
      }
    default:
      return null
  }
})

async function changeStatus() {
  if (statusBtn.value.value === 'Processed') {
    if (!isAllItemsProcessed.value) {
      quasar.dialog({
        message: "Some items are pending. Please process every item.",
        color: "negative"
      })
      return;
    }
  }

  try {
    await ui.confirm({
      title: "Confirm",
      color: statusBtn.value.color,
      message: statusBtn.value.confirm,
      ok: {label: statusBtn.value.action, unelevated: true},
      cancel: true
    })
  } catch (e) {
    return
  }

  changingStatus.value = true
  try {
    await api.patch('order/' + props.id + '/status', { status: statusBtn.value.value })
    ui.notifySuccess("Order status changed")
    await load()
  } catch (e) {
    ui.notifyUnexpectedError()
  } finally {
    changingStatus.value = false
  }
}

const cancellingOrder = ref()
async function cancelOrder()
{
  try {
    await ui.confirm({
      title: "Confirm",
      color: 'negative',
      message: "Do ypu want to cancel the order?",
      ok: {label: 'Cancel', unelevated: true},
      cancel: true
    })
  } catch (e) {
    return
  }

  cancellingOrder.value = true
  try {
    await api.patch('order/' + props.id + '/status', { status: 'Cancelled' })
    ui.notifySuccess("Order cancelled")
    await load()
  } catch (e) {
    ui.notifyUnexpectedError()
  } finally {
    cancellingOrder.value = false
  }
}

const changingItemStatus = reactive({})
async function changeItemStatus(status, id, name = null) {
  if (status === 'Cancelled') {
    try {
      await ui.confirm({
        title: "Confirm",
        color: 'negative',
        message: `Do you want to cancel the <b>${name}</b>?`,
        html: true,
        ok: {label: 'Cancel Item', unelevated: true},
        cancel: true
      })
    } catch (e) {
      return
    }
  }

  changingItemStatus[id] = true
  try {
    await api.patch('order/' + props.id + '/item/' + id + "/status", { status })

    if (status === 'Cancelled') {
      ui.notifySuccess("Item cancelled")
      await load()
      return
    }

    model.value.details.find(v => v.id === id).status = status
  } catch (e) {
    ui.notifyUnexpectedError()
  } finally {
    changingItemStatus[id] = false
  }
}

function openPayment(method) {
  quasar.dialog({
    persistent: true,
    component: PaymentDialog,
    componentProps: {
      type: canI.value.payAmount ? 'Pay' : 'Refund',
      method: method,
      amount: Math.abs(model.value.amountBalance),
      orderId: model.value.id
    }
  }).onOk(() => {
    load()
  })
}

function openRazorPay() {
  window.open("https://dashboard.razorpay.com/app/orders/" + model.value.razorpayOrderId, "_blank");
}
</script>

<style lang="scss" scoped>

</style>
