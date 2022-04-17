import {onMounted, reactive, ref, watch} from "vue";
import {LocalStorage} from "quasar";
import qs from "qs";
import {api} from "boot/axios";
import {useRoute} from "vue-router";

function parseColumns(columns) {
  const filters = {}
  const filterModel = {}
  const select = []
  const include = {}
  const defaultVisible = []

  const route = useRoute()
  const rQuery = qs.parse(route.query)
  const forcedFilter = rQuery.filter ?? {}

  columns.forEach(col => {
    let field = col.field

    if (col.dbField) {
      let part = col.dbField.split('->')
      field = part[0]

      if (part[1]) {
        part = part[1].split(':')

        if (!include[part[0]]) {
          include[part[0]] = []
        }

        if (part[1]) {
          include[part[0]].push(part[1])
        }
      }
    }

    if (!col.dbField && typeof field === "function") {
      field = null
    }

    if (field) {
      select.push(field)
    }


    if (col.visible) {
      defaultVisible.push(col.name)
    }

    if (col.filter) {
      if (typeof col.filter === "object") {
        filters[col.filter.field ?? field] = col.filter
      } else {
        filters[field] = {}
      }

      if (field in forcedFilter) {
        filters[field].default = forcedFilter[field]
        filters[field].forced = true
      }
    }
  })

  Object.keys(filters).forEach(v => {
    filterModel[v] = { value: filters[v].default ?? '', readonly: filters[v].forced ?? false }
  })

  return {
    filters,
    filterModel,
    defaultVisible,
    select: select,
    include: include,
    columns: columns.filter(c => !c.hidden)
  }
}

export function useDataTable(columns) {
  const visibleColumns = ref()
  const pagination = ref({
    sortBy: 'id',
    descending: true,
    page: 1,
    rowsPerPage: 50,
    rowsNumber: 0
  })

  const rows = ref([])
  const tableRef = ref()
  const loading = ref(false)

  let url = '';
  let storageKey = '';

  const parsed = parseColumns(columns)
  visibleColumns.value = parsed.defaultVisible
  const filter = reactive(parsed.filterModel)

  onMounted(() => {
    const pg = LocalStorage.getItem(`settings.${storageKey}.pagination`)
    if (pg) {
      pagination.value.sortBy = pg['sortBy']
      pagination.value.descending = pg['descending']
      pagination.value.rowsPerPage = pg['rowsPerPage'] ? pg['rowsPerPage'] : pagination.value.rowsPerPage
    }

    watch(pagination, _ => {
      LocalStorage.set(`settings.${storageKey}.pagination`, {
        sortBy: pagination.value.sortBy,
        descending: pagination.value.descending,
        rowsPerPage: pagination.value.rowsPerPage,
      })
    }, {deep: true})

    const vc = LocalStorage.getItem(`settings.${storageKey}.visible-columns`)
    if (vc) visibleColumns.value = vc;

    watch(visibleColumns, () => {
      LocalStorage.set(`settings.${storageKey}.visible-columns`, visibleColumns.value)
    })

    trigger()
  })

  watch(filter, () => {
    pagination.value.page = 0
    tableRef.value?.requestServerInteraction()
  })

  const onQTableRequest = (props) => reload(props)

  let fnOnError = () => {}
  let formatQuery = params => params
  let parseResponse = (data) => [data, 0]

  let buildSelectFields = select => select
  let buildIncludeFields = include => {
    return Object.keys(include)
      .reduce((pv, cv) => {
        pv.push(include[cv].length ? (cv + ':' + include[cv].join(',')) : cv);
        return  pv
      }, [])
  }

  let buildFilter = (filter) => {
    return Object.keys(filter)
      .reduce((acc, field) => {
        const value = filter[field].value
        const op = parsed.filters[field]

        if (!op) return acc
        if ((value === null || value === undefined || value === "") && !op.null) return acc

        acc[field] = op.op ? {[op.op]: value} : value
        return acc;
      }, {})
  }

  const onError = (fn) => fnOnError = fn
  const withFilterBuilder = (fn) => buildFilter = fn
  const withQueryFormatter = (fn) => formatQuery = fn
  const withResponseParser = (fn) => parseResponse = fn
  const withOptions = (o) => {
    storageKey = o.storageKey
    url = o.url
  }

  function trigger() {
    tableRef.value.requestServerInteraction()
  }

  async function reload(props) {
    const { page, rowsPerPage, sortBy, descending } = props.pagination

    loading.value = true;
    let params = {}

    if (rowsPerPage) {
      params.limit = rowsPerPage
      params.page = page
    }

    if (descending) {
      params.sortByDesc = sortBy
    } else {
      params.sortByAsc = sortBy
    }

    params.select = buildSelectFields(parsed.select)
    params.include = buildIncludeFields(parsed.include)
    params.filter = buildFilter(filter)
    params = formatQuery(params)

    if (params.select?.length) params.select = params.select.join(',')
    if (params.include?.length) params.include = params.include.join(';')

    const paramsSerializer = (params) => qs.stringify(params)
    try {
      const res = await api.get(`${url}`, {params, paramsSerializer})
      const [data, totalCount] = parseResponse(res.data)

      if (totalCount) {
        pagination.value.rowsNumber = totalCount
      }
      rows.value = data

      data.forEach((v, i) => v._i = i + 1)

      pagination.value.page = page
      pagination.value.rowsPerPage = rowsPerPage
      pagination.value.sortBy = sortBy
      pagination.value.descending = descending
    } catch (e) {
      fnOnError(e)
    } finally {
      loading.value = false
    }
  }

  return {
    columns: parsed.columns,
    visibleColumns,
    pagination,
    filter,
    rows,
    tableRef,
    loading,
    onQTableRequest,
    trigger,
    onError,
    withFilterBuilder,
    withQueryFormatter,
    withResponseParser,
    withOptions
  }
}
