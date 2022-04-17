<template>
  <q-page class="q-gutter-md q-pa-md">
    <q-card>
      <q-card-section>
        <div class="row items-center no-wrap">
          <div class="col">
            <div class="text-h6 q-ma-none">Accounts</div>
          </div>

          <div class="col-auto">
            <q-btn color="primary" flat rounded icon="add" label="Add New" to="/account/new"/>
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
              <StatusBadge :options="ActiveStatus" :value="props.value"/>
            </q-td>
          </template>

          <template v-slot:body-cell-image="props">
            <q-td key="image" :props="props" class="flex flex-center">
              <img class="category-image" alt="img" :src="props.value" v-if="props.value" style="height: 28px;">
            </q-td>
          </template>

          <template v-slot:top>
            <div class="q-col-gutter-md row">
              <q-input class="col" outlined dense stack-label label="Id" clearable v-model="filter.id.value">
                <template v-slot:append><q-icon name="qr_code"/></template>
              </q-input>
              <q-input class="col" outlined dense stack-label label="Name" clearable v-model="filter.name.value"/>
              <q-select class="col" outlined dense stack-label label="Status" clearable options-dense v-model="filter.isActive.value"
                        :options="ActiveStatus" map-options emit-value :readonly="filter.isActive.readonly"
              />
            </div>

            <q-space />

            <DropdownSelectMultiple dense flat icon="view_column" :options="columns" v-model="visibleColumns" option-value="name"/>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <NavigationDrawer :path="['/account/:id', '/account/:id/edit', '/account/new']" @update="trigger"/>
  </q-page>
</template>

<script setup>
import ui from "src/ui";
import {useQuasar} from "quasar";
import {useDataTable} from "src/composables/data-table";
import {Columns, ActiveStatus} from "src/js/model-helpers/accounts";
import NavigationDrawer from "components/drawers/NavigationDrawer";
import {useRouter} from "vue-router";
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
withResponseParser((data) => [data.data.accounts, data.data.totalCount])

withOptions({
  url: 'account',
  storageKey: 'account-list'
})

function onRowClick(evt, row, index) {
  router.currentRoute.value.path === '/account'
    ? router.push('/account/' + row.id)
    : router.replace('/account/' + row.id)
}
</script>

<style lang="scss" scoped>

</style>
