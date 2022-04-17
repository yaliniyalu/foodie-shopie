import {trimWithEllipsis} from "src/js/utils";

export const Status = [
  { value: 'Pending', label: 'Pending', color: 'warning', action: 'Pending' },
  { value: 'Approved', label: 'Approved', color: 'positive', action: 'Approve' },
  { value: 'Rejected', label: 'Rejected', color: 'negative', action: 'Reject' }
]

export const Columns = [
  { name: '_i',       field: (r) => r._i, label: '#', align: 'left',   sortable: false,  visible: true, filter: false },
  { name: 'id',        field: 'id',        label: 'Id',      align: 'left',   sortable: false,  hidden: true, filter: true },
  {
    name: 'item',
    field: r => r.item.name,
    label: 'Item',
    align: 'left',
    sortable: false,
    filter: true,
    dbField: '_itemId->item',
    visible: true
  },
  {
    name: 'customer',
    field: 'customer',
    label: 'Customer',
    align: 'left',
    sortable: false,
    filter: true,
    visible: true,
    dbField: '_customerId->customer'
  },
  {
    name: 'review',
    field: 'review',
    label: 'Review',
    align: 'left',
    sortable: true,
    visible: true,
    format: (val, row) => trimWithEllipsis(val, 50),
    filter: {op: 'neq', default: '', null: true}
  },
  {
    name: 'rating',
    field: 'rating',
    label: 'Rating',
    align: 'left',
    sortable: true,
    visible: true
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
