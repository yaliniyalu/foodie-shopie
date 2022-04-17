<template>
  <q-page class="q-gutter-md q-pa-md">
    <q-card>
      <q-card-section>
        <div class="row items-center no-wrap">
          <div class="col">
            <div class="text-h6 q-ma-none">Coupons</div>
          </div>

          <div class="col-auto">
            <q-btn color="primary" flat rounded icon="add" label="Add New" to="/coupon/new"/>
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
          <template v-slot:body-cell-code="props">
            <q-td key="code" :props="props" class="font-mono">{{ props.value }}</q-td>
          </template>

          <template v-slot:body-cell-discount="props">
            <q-td key="discount" :props="props" class="font-mono">{{ props.value }}</q-td>
          </template>

          <template v-slot:body-cell-usageLimit="props">
            <q-td key="usage_limit" :props="props" class="acc-number">{{ props.value || '-' }}</q-td>
          </template>

          <template v-slot:body-cell-minOrderValue="props">
            <q-td key="min_order_value" :props="props" class="acc-number">{{ props.value || '-' }}</q-td>
          </template>

          <template v-slot:body-cell-maxDiscountValue="props">
            <q-td key="max_discount_value" :props="props" class="acc-number">{{ props.value || '-' }}</q-td>
          </template>

          <template v-slot:body-cell-customerType="props">
            <q-td key="customer_type" :props="props">
              <StatusBadge :options="CustomerTypes" :value="props.value"/>
            </q-td>
          </template>

          <template v-slot:body-cell-expiresOn="props">
            <q-td key="expires_on" :props="props">{{props.value ? humanDateTime(props.value) : '-'}}</q-td>
          </template>

          <template v-slot:body-cell-isActive="props">
            <q-td key="is_active" :props="props">
              <StatusBadge :options="ActiveStatus" :value="props.value"/>
            </q-td>
          </template>

          <template v-slot:top>
            <div class="q-col-gutter-md row">
              <q-input class="col" outlined dense stack-label label="Id" clearable v-model="filter.id.value">
                <template v-slot:append><q-icon name="qr_code"/></template>
              </q-input>
              <q-input class="col" outlined dense stack-label label="Code" clearable v-model="filter.code.value"/>
              <q-select class="col" outlined dense stack-label label="Status" clearable v-model="filter.isActive.value"
                        :options="[{ label: 'Active', value: true }, { label: 'Disabled', value: false }]" map-options emit-value :readonly="filter.isActive.readonly"
              />
            </div>

            <q-space />

            <DropdownSelectMultiple dense flat icon="view_column" :options="columns" v-model="visibleColumns" option-value="name"/>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <NavigationDrawer :path="['/coupon/:id', '/coupon/:id/edit', '/coupon/new']" @update="trigger"/>
  </q-page>
</template>

<script setup>
import ui from "src/ui";
import {useQuasar} from "quasar";
import {useDataTable} from "src/composables/data-table";
import {Columns, CustomerTypes, ActiveStatus} from "src/js/model-helpers/coupons";
import NavigationDrawer from "components/drawers/NavigationDrawer";
import {useRouter} from "vue-router";
import {humanDateTime} from "src/js/utils";
import StatusBadge from "components/badge/StatusBadge";
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
  withResponseParser,
  withOptions
} = useDataTable(Columns)

onError(() => ui.notifyUnexpectedError())
withResponseParser((data) => [data.data.coupons, data.data.totalCount])

withOptions({
  url: 'coupon',
  storageKey: 'coupon-list'
})

function onRowClick(evt, row, index) {
  router.currentRoute.value.path === '/coupon'
    ? router.push('/coupon/' + row.id)
    : router.replace('/coupon/' + row.id)
}
</script>

<style lang="scss" scoped>

</style>
