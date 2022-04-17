<template>
  <q-page class="q-gutter-md q-pa-md">
    <q-card>
      <q-card-section>
        <div class="row items-center no-wrap">
          <div class="col">
            <div class="text-h6 q-ma-none">Orders</div>
          </div>
          <div class="col text-right">
            <q-btn color="primary" round flat icon="filter_list" @click="filterDialog = !filterDialog">
              <q-badge color="red" floating v-if="filterCount">{{ filterCount }}</q-badge>
            </q-btn>
            <q-btn color="primary" round flat icon="refresh" @click="trigger()"/>
            <q-btn color="primary" round flat :icon="display === 'map' ? 'grid_on' : 'map'" @click="display = display === 'map' ? 'table' : 'map'"/>
          </div>
        </div>
      </q-card-section>

      <q-separator/>

      <q-card-section v-show="display === 'table'">
        <q-table
          separator="horizontal"
          flat
          bordered
          :columns="columns"
          row-key="id"
          color="primary"

          binary-state-sort

          ref="tableRef"
          :rows="rows"
          :loading="loading"
          :visible-columns="visibleColumns"
          v-model:pagination="pagination"
          @request="onQTableRequest"

          @row-click="onRowClick"

          :rows-per-page-options="[10, 15, 25, 50, 0]"
        >
          <template v-slot:body-cell-created_at="props">
            <q-td key="created_at" :props="props" class="font-mono">
              {{ formatDateTime(props.value) }}
              <q-tooltip>
                {{ humanDateTime(props.value) }}
              </q-tooltip>
            </q-td>
          </template>

          <template v-slot:body-cell-customer="props">
            <q-td key="customer" :props="props">
              {{ props.value.phone }}
              <q-tooltip>
                <span v-if="props.value.name">{{ props.value.name }}<br/></span>
                {{ props.value.customer_type }}
              </q-tooltip>
            </q-td>
          </template>

          <template v-slot:body-cell-amount_total="props">
            <q-td key="amount_total" :props="props" class="font-mono">
              {{ props.value.toFixed(2) }}
            </q-td>
          </template>

          <template v-slot:body-cell-amount_paid="props">
            <q-td key="amount_paid" :props="props" class="font-mono">
              {{ props.value.toFixed(2) }}
            </q-td>
          </template>

          <template v-slot:body-cell-amount_balance="props">
            <q-td key="amount_balance" :props="props" class="font-mono">
              <span class="text-negative" v-if="props.value > 0">{{ props.value.toFixed(2) }}</span>
              <span class="text-accent" v-else-if="props.value < 0">{{ props.value.toFixed(2) }}</span>
              <span class="text-positive" v-else>0</span>
            </q-td>
          </template>

          <template v-slot:body-cell-status="props">
            <q-td key="status" :props="props">
              <StatusBadge :options="OrderStatus" :value="props.value"/>
            </q-td>
          </template>

          <template v-slot:body-cell-assigned_to="props">
            <q-td key="assigned_to" :props="props">
              {{ props.value?.name }}
              <q-tooltip v-if="props.value">
                <span>{{ props.value.phone }}<br/></span>
                {{ props.value.type }}
              </q-tooltip>
            </q-td>
          </template>

          <template v-slot:top>
            <div class="q-col-gutter-md row">
              <q-input class="col" outlined dense stack-label label="Id" clearable v-model="filter.id"/>
            </div>

            <q-space />

            <DropdownSelectMultiple dense flat icon="view_column" :options="columns" v-model="visibleColumns" option-value="name"/>
          </template>
        </q-table>
      </q-card-section>

      <q-card-section v-show="display === 'map'">
        <OrderMap :rows="rows"/>

        <q-inner-loading :showing="loading">
          <q-spinner-radio color="primary" size="50"/>
        </q-inner-loading>
      </q-card-section>
    </q-card>

    <q-dialog position="top" v-model="filterDialog">
      <q-card class="full-width">
        <q-card-section class="flex row q-col-gutter-md">
          <q-input    class="col-4" outlined stack-label dense clearable label="Order No" v-model="filter.id"/>
          <DatePicker class="col-4" outlined stack-label dense clearable label="From Date" v-model="filter.from"/>
          <DatePicker class="col-4" outlined stack-label dense clearable label="To Date" v-model="filter.to"/>
          <q-select   class="col-4" outlined stack-label dense clearable emit-value map-options label="Status" multiple :options="OrderStatus" v-model="filter.status"/>

          <SelectLocation  class="col-4" outlined stack-label dense clearable emit-value map-options label="Location" multiple v-model="filter.location" />
          <SelectCustomer  class="col-4" outlined stack-label dense clearable emit-value map-options label="Customer" v-model="filter.customer"/>
          <SelectAccount   class="col-4" outlined stack-label dense clearable emit-value map-options label="Assigned To" v-model="filter.assigned_to"/>
        </q-card-section>
      </q-card>
    </q-dialog>

    <NavigationDrawer :path="['/order/:id', '/order/:id/edit', '/order/new']" @update="trigger"/>
  </q-page>
</template>

<script setup>
import ui from "src/ui";
import {date, useQuasar} from "quasar";
import {useDataTable} from "src/composables/data-table";
import {Columns, OrderStatus, formatDateTime} from "src/js/model-helpers/orders";
import NavigationDrawer from "components/drawers/NavigationDrawer";
import {useRouter} from "vue-router";
import {humanDateTime} from "src/js/utils";
import StatusBadge from "components/badge/StatusBadge";
import DropdownSelectMultiple from "components/DropdownSelectMultiple";
import {computed, reactive, ref, watch} from "vue";
import OrderMap from "pages/order/components/OrderMap";
import CustomSelect from "components/select/CustomSelect";
import SelectAccount from "components/select/SelectAccount";
import SelectCustomer from "components/select/SelectCustomer";
import DatePicker from "components/DatePicker";
import SelectLocation from "components/select/SelectLocation";

const router = useRouter()
const quasar = useQuasar()

const {
  visibleColumns,
  columns,
  pagination,
  rows,
  tableRef,
  trigger,
  loading,
  onQTableRequest,
  onError,
  withResponseParser,
  withOptions,
  withQueryFormatter
} = useDataTable(Columns)

onError(() => ui.notifyUnexpectedError())
withResponseParser((data) => [data.data.orders, data.data.totalCount])

pagination.value.sortBy = 'createdAt'
pagination.value.descending = true

const defaultStatus = ['Pending', 'Processing', 'Processed', 'Dispatched']

const filter = reactive({
  id: null,
  from: null,
  to: null,
  location: [],
  status: [...defaultStatus],
  customer: null,
  assigned_to: null
})

withQueryFormatter((params) => {
  params.select.push('address')
  params.include.push('address.location')

  if (filter.id) params.filter['id'] = filter.id
  if (filter.from) params.filter['createdAt'] = {'gte': filter.from + ' 00:00:00'}
  if (filter.to) params.filter['createdAt'] = {'lte': filter.to + ' 23:59:59'}
  if (filter.location?.length) params.filter['_locationId'] = {'in': filter.location.join(',')}
  if (filter.status?.length) {
    params.filter['status'] = {'in': filter.status.join(',')}
  } else {
    params.filter['status'] = {'in': OrderStatus.map(v => v.value).join(',')}
  }
  if (filter.customer) params.filter['_customerId'] = filter.customer
  if (filter.assigned_to) params.filter['_assignedTo'] = filter.assigned_to

  return params
})

const filterCount = computed(() => {
  let count = 0;

  if (filter.id) count ++
  if (filter.from) count ++
  if (filter.to) count ++
  if (filter.location?.length) count ++
  if (!isArrayEqual(filter.status ?? [], defaultStatus)) count ++
  if (filter.customer) count ++
  if (filter.assigned_to) count ++

  return count
})

watch(filter, trigger, {deep: true})

withOptions({
  url: 'order',
  storageKey: 'order-list'
})

function onRowClick(evt, row, index) {
  router.currentRoute.value.path === '/order'
    ? router.push('/order/' + row.id)
    : router.replace('/order/' + row.id)
}

const display = ref('table')
const filterDialog = ref(false)

function isArrayEqual(a1, a2) {
  const array2Sorted = a2.slice().sort();
  return a1.length === a2.length && a1.slice().sort().every((value, index) => value === array2Sorted[index])
}
</script>

<style lang="scss" scoped>

</style>
