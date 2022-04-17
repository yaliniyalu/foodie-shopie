<template>
  <q-page class="q-gutter-md q-pa-md">
    <q-card>
      <q-card-section>
        <div class="row items-center no-wrap">
          <div class="col">
            <div class="text-h6 q-ma-none">Customers</div>
          </div>
        </div>
      </q-card-section>

      <q-separator/>

      <q-card-section>
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
          <template v-slot:body-cell-isActive="props">
            <q-td key="is_active" :props="props">
              <q-badge color="green" label="Active"    v-if="props.value"/>
              <q-badge color="red"   label="Inactive"  v-else/>
            </q-td>
          </template>

          <template v-slot:body-cell-customerType="props">
            <q-td key="is_active" :props="props">
              <q-badge color="primary" label="Prime"    v-if="props.value === 'Prime'"/>
              <q-badge color="secondary"   label="Normal"  v-else/>
            </q-td>
          </template>

          <template v-slot:body-cell-image="props">
            <q-td key="image" :props="props" class="flex flex-center">
              <img class="category-image" alt="img" :src="props.value" v-if="props.value" style="height: 28px;">
            </q-td>
          </template>

          <template v-slot:body-cell-statTotalOrderAmount="props">
            <q-td key="stat_total_order_amount" :props="props" class="acc-number">
              {{ props.value.toFixed(2) }}
            </q-td>
          </template>

          <template v-slot:body-cell-statOrderFrequency="props">
            <q-td key="stat_order_frequency" :props="props" class="acc-number">
              {{ getOrderFrequency(props.row) }}
            </q-td>
          </template>

          <template v-slot:top>
            <div class="q-gutter-md row">
              <q-input class="col" outlined dense stack-label label="Id" clearable v-model="filter.id.value">
                <template v-slot:append><q-icon name="qr_code"/></template>
              </q-input>
              <q-input class="col" outlined dense stack-label label="Name" clearable v-model="filter.name.value"/>
              <q-select class="col" outlined dense stack-label label="Type" clearable options-dense v-model="filter.customerType.value"
                        :options="[ 'Normal', 'Prime']" map-options emit-value :readonly="filter.customerType.readonly"
              />
              <q-select class="col" outlined dense stack-label label="Status" clearable options-dense v-model="filter.isActive.value"
                        :options="[{ label: 'Active', value: true }, { label: 'Inactive', value: false }]" map-options emit-value :readonly="filter.isActive.readonly"
              />
            </div>

            <q-space />

            <DropdownSelectMultiple dense flat icon="view_column" :options="columns" v-model="visibleColumns" option-value="name"/>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <NavigationDrawer path="/customer/:id" @update="trigger"/>
  </q-page>
</template>

<script setup>
import ui from "src/ui";
import {useQuasar} from "quasar";
import {useDataTable} from "src/composables/data-table";
import {Columns, getOrderFrequency} from "src/js/model-helpers/customers";
import {useRouter} from "vue-router";
import NavigationDrawer from "components/drawers/NavigationDrawer";
import DropdownSelectMultiple from "components/DropdownSelectMultiple";

const router = useRouter()
const quasar = useQuasar()

const {
  visibleColumns,
  columns,
  pagination,
  filter,
  rows,
  tableRef,
  trigger,
  loading,
  onQTableRequest,
  onError,
  withFilterBuilder,
  withResponseParser,
  withOptions
} = useDataTable(Columns)

pagination.value.sortBy = 'name'
pagination.value.descending = false

onError(() => ui.notifyUnexpectedError())
withResponseParser((data) => [data.data.customers, data.data.totalCount])

withOptions({
  url: 'customer',
  storageKey: 'customer-list'
})

function onRowClick(evt, row, index) {
  router.currentRoute.value.path === '/customer'
    ? router.push('/customer/' + row.id)
    : router.replace('/customer/' + row.id)
}
</script>

<style lang="scss" scoped>

</style>
