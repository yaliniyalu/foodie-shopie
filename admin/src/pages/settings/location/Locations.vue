<template>
  <q-page class="q-gutter-md q-pa-md">
    <q-card>
      <q-card-section>
        <div class="row items-center no-wrap">
          <div class="col">
            <div class="text-h6 q-ma-none">Locations</div>
          </div>

          <div class="col-auto">
            <q-btn color="primary" flat rounded icon="add" label="Add New" to="/settings/location/new"/>
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

          <template v-slot:body-cell-fee="props">
            <q-td key="fee" :props="props" class="acc-number">{{ props.value }}</q-td>
          </template>

          <template v-slot:top>
            <div class="q-col-gutter-md row">
              <q-input class="col" outlined dense stack-label label="Name" clearable v-model="filter.name.value"/>
              <q-input class="col" outlined dense stack-label label="Pincode" clearable v-model="filter.pincode.value"/>
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

    <NavigationDrawer :path="['/settings/location/:id', '/settings/location/:id/edit', '/settings/location/new']" @update="trigger"/>
  </q-page>
</template>

<script setup>
import ui from "src/ui";
import {useQuasar} from "quasar";
import {useDataTable} from "src/composables/data-table";
import {Columns, ActiveStatus} from "src/js/model-helpers/locations";
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

pagination.value.sortBy = 'name'
pagination.value.descending = false

onError(() => ui.notifyUnexpectedError())
withResponseParser((data) => [data.data.locations, data.data.totalCount])

withOptions({
  url: 'location',
  storageKey: 'location-list'
})

function onRowClick(evt, row, index) {
  router.currentRoute.value.path === '/settings/location'
    ? router.push('/settings/location/' + row.id)
    : router.replace('/settings/location/' + row.id)
}
</script>

<style lang="scss" scoped>

</style>
