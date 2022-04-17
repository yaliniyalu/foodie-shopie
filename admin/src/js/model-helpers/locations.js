
export const Columns = [
  { name: '_i',          field: (r) => r._i, label: '#',          align: 'left',   sortable: false,  visible: true, filter: false },
  { name: 'id',         field: 'id',         label: '#',          align: 'left',   sortable: true,  visible: false, hidden: true, filter: false },
  { name: 'name',       field: 'name',       label: 'Name',       align: 'left',   sortable: true,  visible: true, filter: {op: 'ct'} },
  { name: 'pincode',    field: 'pincode',    label: 'Pincode',    align: 'left',   sortable: true,  visible: true, filter: {op: 'sw'} },
  { name: 'fee',        field: 'fee',        label: 'Fee',        align: 'right',  sortable: true,  visible: true},
  { name: 'isActive',   field: 'isActive',   label: 'Status',     align: 'left',   sortable: false,  visible: true, filter: {default: true} },
]

export const ActiveStatus = [
  { value: true, label: 'Can Deliver', color: 'positive', action: 'Can Deliver' },
  { value: false, label: 'Cannot Deliver', color: 'negative', action: 'Cannot Deliver' }
]
