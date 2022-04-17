
export const Columns = [
  { name: '_i',       field: (r) => r._i, label: '#', align: 'left',   sortable: false,  visible: true, filter: false },
  { name: 'id',        field: 'id',        label: 'Id',      align: 'left',   sortable: true,  hidden: true, filter: true },
  { name: 'name',      field: 'name',      label: 'Name',   align: 'left',   sortable: true,  visible: true, filter: {op: 'ct'} },

  { name: 'image',     field: 'image',     label: 'Image',  align: 'center', sortable: false, visible: false, filter: false },
  { name: 'email',     field: 'email',     label: 'Email',  align: 'left',   sortable: false, visible: true, filter: {op: 'sw'} },
  { name: 'phone',     field: 'phone',     label: 'Phone',  align: 'left',   sortable: false, visible: true, filter: {op: 'sw'} },

  { name: 'isActive',   field: 'isActive',   label: 'Status',      align: 'left',   sortable: false,  visible: true, filter: {default: true} },
]

export const ActiveStatus = [
  { value: true, label: 'Active', color: 'positive', action: 'Enable' },
  { value: false, label: 'Disabled', color: 'negative', action: 'Disable' }
]

export const AccountTypes = [
  { value: 'Admin',    label: 'Admin',    color: 'purple', action: 'Admin' },
  { value: 'Delivery', label: 'Delivery', color: 'indigo', action: 'Delivery' }
]
