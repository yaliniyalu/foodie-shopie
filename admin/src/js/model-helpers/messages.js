import {trimWithEllipsis} from "src/js/utils";

export const Status = [
  { value: 'Pending', label: 'Pending', color: 'warning', action: 'Pending' },
  { value: 'Resolved', label: 'Resolved', color: 'positive', action: 'Resolve' },
]

export const Columns = [
  { name: '_i',       field: (r) => r._i, label: '#', align: 'left',   sortable: false,  visible: true, filter: false },
  { name: 'id',        field: 'id',        label: 'Id',      align: 'left',   sortable: false,  hidden: true, filter: true },
  {
    name: 'customer',
    field: r => r.customer?.name,
    label: 'Customer',
    align: 'left',
    sortable: false,
    filter: true,
    hidden: true,
    dbField: '_customerId->customer'
  },
  {
    name: 'name',
    field: 'name',
    label: 'Name',
    align: 'left',
    sortable: true,
    visible: true,
    filter: true
  },
  {
    name: 'phone',
    field: 'phone',
    label: 'Phone',
    align: 'left',
    sortable: true,
    visible: true,
    format: (val) => "+91 " + val
  },
  {
    name: 'message',
    field: 'message',
    label: 'Message',
    align: 'left',
    sortable: true,
    visible: true,
    format: (val) => trimWithEllipsis(val, 50)
  },
  {
    name: 'status',
    field: 'status',
    label: 'Status',
    align: 'left',
    sortable: true,
    filter: {
      default: 'Pending'
    },
    visible: true
  },
]
