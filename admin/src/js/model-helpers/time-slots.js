export const Columns = [
  { name: 'id',             field: 'id',             label: '#',        align: 'left',   sortable: true, visible: true, filter: true },
  { name: 'name',           field: 'name',           label: 'Name',     align: 'left',   sortable: true, visible: true, filter: {op: 'ct'} },
]

export const Status = [
  { value: 1, label: 'Enabled',  color: 'positive', action: 'Enable' },
  { value: 0, label: 'Disabled', color: 'negative', action: 'Disable' }
]
