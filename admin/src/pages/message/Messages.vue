<template>
  <q-page class="q-gutter-md q-pa-md">
    <q-card>
      <q-card-section>
        <div class="row items-center no-wrap">
          <div class="col">
            <div class="text-h6 q-ma-none">Messages</div>
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
          <template v-slot:body-cell-status="props">
            <q-td key="is_active" :props="props">
              <StatusBadge :options="Status" :value="props.value"/>
            </q-td>
          </template>

          <template v-slot:top>
            <div class="q-col-gutter-md row">
              <q-input class="col" outlined dense stack-label label="Id" clearable v-model="filter.id.value">
              <template v-slot:append><q-icon name="qr_code"/></template>
            </q-input>
              <q-select class="col mw-150" outlined dense stack-label label="Status" clearable v-model="filter.status.value" :readonly="filter.status.readonly"
                        :options="Status" map-options emit-value
              />
              <SelectCustomer class="col mw-150" outlined dense stack-label label="Customer" clearable v-model="filter._customerId.value" :readonly="filter._customerId.readonly" map-options emit-value/>
            </div>

            <q-space/>

            <DropdownSelectMultiple dense flat icon="view_column" :options="columns" v-model="visibleColumns" option-value="name"/>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <NavigationDrawer path="/message/:id" @update="trigger"/>
  </q-page>
</template>

<script setup>
import ui from "src/ui";
import {useQuasar} from "quasar";
import {useDataTable} from "src/composables/data-table";
import {Columns, Status} from "src/js/model-helpers/messages";
import StatusBadge from "components/badge/StatusBadge";
import SelectCustomer from "components/select/SelectCustomer";
import {useRouter} from "vue-router";
import NavigationDrawer from "components/drawers/NavigationDrawer";
import DropdownSelectMultiple from "components/DropdownSelectMultiple";

const quasar = useQuasar()
const router = useRouter()

const {
  columns,
  visibleColumns,
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

pagination.value.sortBy = 'createdAt'

onError(() => ui.notifyUnexpectedError())
withResponseParser((data) => [data.data.messages, data.data.totalCount])

withOptions({
  url: 'message',
  storageKey: 'message-list'
})

function onRowClick(evt, row, index) {
  router.currentRoute.value.path === '/message'
    ? router.push('/message/' + row.id)
    : router.replace('/message/' + row.id)
}
</script>

<style lang="scss" scoped>

</style>
