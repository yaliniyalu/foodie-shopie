<template>
  <div style="position: relative">
    <q-table
      separator="horizontal"
      flat
      bordered
      color="primary"

      :title="title"

      ref="tableRef"
      :columns="columns"
      :rows="rows"
      :loading="loading"
      v-model:pagination="pagination"
      @request="loadTable"
      :rows-per-page-options="[10, 15, 25, 50]"
      binary-state-sort
    >
      <template v-slot:body-cell-name="props">
        <q-td key="name" :props="props">
        <span v-if="type === 'customer'">
          {{ props.row.name || props.row.phone }}<br>
          <span class="text-grey" v-if="props.row.name">{{ props.row.phone }}</span>
        </span>
          <span v-if="type === 'item'">
          {{ props.row.name }}<br>
          <span class="text-grey">{{ props.row.code }}</span>
        </span>
          <span v-if="type === 'location'">
          {{ props.row.name }}<br>
          <span class="text-grey">{{ props.row.pincode }}</span>
        </span>
        </q-td>
      </template>

      <template v-slot:body-cell-totalCount="props">
        <q-td key="totalCount" :props="props" class="acc-number">{{ props.value }}</q-td>
      </template>

      <template v-slot:body-cell-totalAmount="props">
        <q-td key="totalAmount" :props="props" class="acc-number">{{ props.value.toFixed(2) }}</q-td>
      </template>

      <template v-slot:body-cell-totalDiscount="props">
        <q-td key="totalDiscount" :props="props" class="acc-number">{{ props.value.toFixed(2) }}</q-td>
      </template>
    </q-table>

    <q-inner-loading
      :showing="loading"
      label="Please wait... This may take several minutes."
      label-class="text-teal"
      label-style="font-size: 1.1em"
    />
  </div>
</template>

<script setup>

import {onMounted, ref, watch} from "vue";
import {api} from "boot/axios";
import ui from "src/ui";

const props = defineProps({
  where: Object,
  type: String,
  title: String
})

const rows = ref([])
const loading = ref(true)
const tableRef = ref()

const pagination = ref({
  sortBy: 'totalCount',
  descending: true,
  page: 1,
  rowsPerPage: 25,
  rowsNumber: 25
})

const columns = [
    { name: 'name',           field: 'name',          label: 'Name',      align: 'left',  sortable: false },
    { name: 'totalCount',     field: 'totalCount',    label: 'Count',     align: 'right', sortable: true },
    { name: 'totalAmount',    field: 'totalAmount',   label: 'Amount',    align: 'right', sortable: true },
    { name: 'totalDiscount',  field: 'totalDiscount', label: 'Discount',  align: 'right', sortable: true },
]

async function loadTable(p) {
  const { page, rowsPerPage, sortBy, descending } = p.pagination

  const query = {
    type: props.type,
    where: props.where,
    orderBy: [sortBy, descending ? 'desc' : 'asc'],
    offset: (rowsPerPage * page) - rowsPerPage,
    limit: rowsPerPage
  }

  loading.value = true
  try {
    const res = await api.post('/analytics/table', query)
    rows.value = res.data.data[0][props.type + 'Data']

    pagination.value.page = page
    pagination.value.rowsPerPage = rowsPerPage
    pagination.value.sortBy = sortBy
    pagination.value.descending = descending
    pagination.value.rowsNumber = 50
  } catch (e) {
    ui.notifyUnexpectedError()
  } finally {
    loading.value = false
  }
}

function trigger() {
  tableRef.value.requestServerInteraction()
}

onMounted(() => trigger())
watch(() => props.where, () => trigger())

</script>

<style lang="scss" scoped>

</style>
