function buildCreatedBy(name, from) {
    return {
        name,
        from,
        to: 'User',
        field: 'createdBy',
        multiple: false,
        unpackFields: {
            time: 'createdAt'
        }
    }
}

function buildUpdatedBy(name, from) {
    return {
        name,
        from,
        to: 'User',
        field: 'updatedBy',
        multiple: false,
        unpackFields: {
            time: 'updatedAt'
        }
    }
}

const User = {
    name: 'User',
    fields: ['id', 'name', 'email', 'image', 'phone', 'isActive'],
    edges: {
        USER_CREATED_BY: buildCreatedBy('USER_CREATED_BY', 'User'),
        USER_UPDATED_BY: buildUpdatedBy('USER_UPDATED_BY', 'User')
    }
}

const Location = {
    name: 'Location',
    fields: ['id', 'name', 'pincode', 'fee', 'isActive', 'lat', 'lng'],
    edges: {
        LOCATION_CREATED_BY: buildCreatedBy('LOCATION_CREATED_BY', 'Location'),
        LOCATION_UPDATED_BY: buildUpdatedBy('LOCATION_UPDATED_BY', 'Location')
    }
}

const Category = {
    name: 'Category',
    fields: ['id', 'name', 'image', 'bannerImage', 'description', 'isActive', '_parentId'],
    edges: {
        PARENT_CATEGORY: {
            name: 'PARENT_CATEGORY',
            from: 'Category',
            to: 'Category',
            field: 'parent',
            multiple: false,
        },
        reverse_PARENT_CATEGORY: {
            name: 'reverse_PARENT_CATEGORY',
            from: 'Category',
            to: 'Category',
            field: 'subCategory',
            multiple: true,
        },
        CATEGORY_CREATED_BY: buildCreatedBy('CATEGORY_CREATED_BY', 'Category'),
        CATEGORY_UPDATED_BY: buildUpdatedBy('CATEGORY_UPDATED_BY', 'Category')
    }
}

const Coupon = {
    name: 'Coupon',
    fields: ['id', 'code', 'customerType', 'discountType', 'discountValue', 'usageLimit', 'minOrderValue', 'maxDiscountValue', 'expiresOn', 'isActive'],
    edges: {
        COUPON_CREATED_BY: buildCreatedBy('COUPON_CREATED_BY', 'Coupon'),
        COUPON_UPDATED_BY: buildUpdatedBy('COUPON_UPDATED_BY', 'Coupon'),
        reverse_ORDER_HAS_COUPON: {
            name: 'reverse_ORDER_HAS_COUPON',
            from: 'Coupon',
            to: 'SalesOrder',
            field: 'orders',
            multiple: true,
            pushFields: {
                discount: 'appliedDiscount'
            }
        }
    }
}

const ItemImage = {
    name: 'ItemImage',
    fields: ['image', 'isDefault']
}

const ItemDiscount = {
    name: 'ItemDiscount',
    fields: ['discountType', 'discountValue', 'customerType']
}

const Item = {
    name: 'Item',
    fields: ['id', 'code', 'name', 'unit', 'isPack', 'qtyPerSlice', 'minOrderQty', 'maxOrderQty', 'shortDescription',
        'description', 'specification', 'isAvailable', 'price', 'maintainStock', 'stock', 'isActive', '_categoryId',
        'rating', 'ratingCount', 'reviewCount', 'purchaseCount', 'createdAt'],
    edges: {
        ITEM_CREATED_BY: buildCreatedBy('ITEM_CREATED_BY', 'Item'),
        ITEM_UPDATED_BY: buildUpdatedBy('ITEM_UPDATED_BY', 'Item'),
        ITEM_IN_CATEGORY: {
            name: 'ITEM_IN_CATEGORY',
            from: 'Item',
            to: 'Category',
            field: 'category',
            multiple: false,
        },
        ITEM_HAS_IMAGE: {
            name: 'ITEM_HAS_IMAGE',
            from: 'Item',
            to: 'ItemImage',
            field: 'images',
            multiple: true,
        },
        ITEM_HAS_DISCOUNT: {
            name: 'ITEM_HAS_DISCOUNT',
            from: 'Item',
            to: 'ItemDiscount',
            field: 'discounts',
            multiple: true
        },
        ITEM_HAS_REVIEW: {
            name: 'ITEM_HAS_REVIEW',
            from: 'Item',
            to: 'ItemReview',
            field: 'reviews',
            multiple: true
        },
        reverse_CART_HAS_ITEM: {
            name: 'reverse_CART_HAS_ITEM',
            from: 'Item',
            to: 'Cart',
            field: 'cart',
            multiple: false,
            condition: (args) => `{_customerId: {_eq: "${args.customerId ?? '_'}"}}`
        },
        reverse_WISHLIST_HAS_ITEM: {
            name: 'reverse_WISHLIST_HAS_ITEM',
            from: 'Item',
            to: 'WishList',
            field: 'wishlist',
            multiple: false,
            condition: (args) => `{_customerId: {_eq: "${args.customerId ?? '_'}"}}`
        }
    }
}

const TodayDeal = {
    name: 'TodayDeal',
    fields: ['id'],
    edges: {
        TODAY_DEAL_HAS_ITEM: {
            name: 'TODAY_DEAL_HAS_ITEM',
            from: 'TodayDeal',
            to: 'Item',
            field: 'item',
            multiple: true
        }
    }
}

const Customer = {
    name: 'Customer',
    fields: ['id', 'name', 'customerType', 'email', 'phone', 'image', 'isActive', 'createdAt', 'statTotalOrders', 'statTotalOrderAmount', 'statTotalReviews', 'statTotalOrdersCancelled'],
    edges: {
        CUSTOMER_HAS_CART: {
            name: 'CUSTOMER_HAS_CART',
            from: 'Customer',
            to: 'Cart',
            field: 'cart',
            multiple: true
        },
        CUSTOMER_HAS_WISHLIST: {
            name: 'CUSTOMER_HAS_WISHLIST',
            from: 'Customer',
            to: 'WishList',
            field: 'wishlist',
            multiple: true
        },
        CUSTOMER_VIEWED_LOG: {
            name: 'CUSTOMER_VIEWED_LOG',
            from: 'Customer',
            to: 'ItemViewedLog',
            field: 'itemViewedLog',
            multiple: true
        },
        CUSTOMER_WRITES_REVIEW: {
            name: 'CUSTOMER_WRITES_REVIEW',
            from: 'Customer',
            to: 'ItemReview',
            field: 'reviews',
            multiple: true
        },
        CUSTOMER_HAS_ADDRESS: {
            name: 'CUSTOMER_HAS_ADDRESS',
            from: 'Customer',
            to: 'Address',
            field: 'address',
            multiple: true
        }
    }
}

const CustomerMessage = {
    name: 'CustomerMessage',
    fields: ['id', 'name', 'phone', 'message', 'status', 'createdAt', 'updatedAt', '_customerId'],
    edges: {
        CUSTOMER_MESSAGE_CREATED_BY: {
            name: 'CUSTOMER_MESSAGE_CREATED_BY',
            from: 'CustomerMessage',
            to: 'Customer',
            field: 'customer',
            multiple: false
        }
    }
}

const AuthSession = {
    name: 'AuthSession',
    fields: ['id', '_customerId', 'fcmId'],
    edges: {
        AUTH_SESSION_FOR_CUSTOMER: {
            name: 'AUTH_SESSION_FOR_CUSTOMER',
            from: 'AuthSession',
            to: 'Customer',
            field: 'customer',
            multiple: false
        }
    }
}

const Cart = {
    name: 'Cart',
    fields: ['id', '_customerId', '_itemId', 'qty'],
    edges: {
        CART_HAS_ITEM: {
            name: 'CART_HAS_ITEM',
            from: 'Cart',
            to: 'Item',
            field: 'item',
            multiple: false
        }
    }
}

const WishList = {
    name: 'WishList',
    fields: ['id', '_customerId', '_itemId'],
    edges: {
        WISHLIST_HAS_ITEM: {
            name: 'WISHLIST_HAS_ITEM',
            from: 'WishList',
            to: 'Item',
            field: 'item',
            multiple: false
        }
    }
}

const ItemViewedLog = {
    name: 'ItemViewedLog',
    fields: ['id', '_customerId', '_itemId', 'viewedOn', 'viewedCount'],
    edges: {
        LOG_HAS_ITEM: {
            name: 'LOG_HAS_ITEM',
            from: 'ItemViewedLog',
            to: 'Item',
            field: 'item',
            multiple: false
        }
    }
}

const ItemReview = {
    name: 'ItemReview',
    fields: ['id', '_customerId', '_itemId', 'review', 'rating', 'status', 'createdAt'],
    edges: {
        reverse_ITEM_HAS_REVIEW: {
            name: 'reverse_ITEM_HAS_REVIEW',
            from: 'ItemReview',
            to: 'Item',
            field: 'item',
            multiple: false
        },
        CUSTOMER_WRITES_REVIEW: {
            name: 'CUSTOMER_WRITES_REVIEW',
            from: 'ItemReview',
            to: 'Customer',
            field: 'customer',
            multiple: false
        }
    }
}

const Address = {
    name: 'Address',
    fields: ['id','_customerId','name','phone','email', 'street', 'address1', 'address2', 'landmark', 'city', 'district',
        'state', 'country', 'pincode', 'createdAt', 'updatedAt', 'locationId'],
    edges: {
        ADDRESS_HAS_LOCATION: {
            name: 'ADDRESS_HAS_LOCATION',
            from: 'Address',
            to: 'Location',
            field: 'location',
            multiple: false
        },
    }
}

const SalesOrder = {
    name: 'SalesOrder',
    fields: [
        'id', '_customerId', '_addressId', '_assignedTo', 'itemsCount', 'amountItems', 'amountDiscount', 'amountPromotion',
        'amountDelivery', 'amountTotal', 'amountPaid', 'amountRefunded', 'amountBalance', 'paymentType', 'paymentStatus',
        'razorpayOrderId', 'razorpayPaymentId', 'razorpaySignature', 'expectedDeliveryTime', 'status', 'statusChangedAt',
        'createdAt', 'updatedAt',
    ],
    edges: {
        ORDER_HAS_DETAIL: {
            name: 'ORDER_HAS_DETAIL',
            from: 'SalesOrder',
            to: 'OrderDetail',
            field: 'details',
            multiple: true
        },
        ORDER_HAS_PAYMENT_LOG: {
            name: 'ORDER_HAS_PAYMENT_LOG',
            from: 'SalesOrder',
            to: 'PaymentLog',
            field: 'paymentLogs',
            multiple: true
        },
        ORDER_HAS_COUPON: {
            name: 'ORDER_HAS_COUPON',
            from: 'SalesOrder',
            to: 'Coupon',
            field: 'coupon',
            multiple: false
        },
        ORDER_HAS_DELIVERY_ADDRESS: {
            name: 'ORDER_HAS_DELIVERY_ADDRESS',
            from: 'SalesOrder',
            to: 'Address',
            field: 'address',
            multiple: false
        },
        ORDER_PLACED_BY: {
            name: 'ORDER_PLACED_BY',
            from: 'SalesOrder',
            to: 'Customer',
            field: 'customer',
            multiple: false
        },
        ORDER_ASSIGNED_TO: {
            name: 'ORDER_ASSIGNED_TO',
            from: 'SalesOrder',
            to: 'User',
            field: 'assignedTo',
            multiple: false
        }
    }
}

const OrderDetail = {
    name: 'OrderDetail',
    fields: ['id', '_orderId', '_itemId', 'itemName', 'qty', 'price', 'discount', 'amount', 'amountItem', 'amountDiscount', 'sellingPrice', 'discountStr', 'status'],
    edges: {
        ORDER_DETAIL_HAS_ITEM: {
            name: 'ORDER_DETAIL_HAS_ITEM',
            from: 'OrderDetail',
            to: 'Item',
            field: 'item',
            multiple: false
        }
    }
}

const PaymentLog = {
    name: 'PaymentLog',
    fields: ['id', 'type', 'method', 'amount', 'fee', 'createdAt'],
    edges: {
        PAYMENT_LOG_CREATED_BY: {
            name: 'PAYMENT_LOG_CREATED_BY',
            from: 'PaymentLog',
            to: 'User',
            field: 'createdBy',
            multiple: false
        }
    }
}


const Schema = {
    User,
    Location,
    Category,
    Coupon,
    ItemImage,
    ItemDiscount,
    Item,
    TodayDeal,
    Customer,
    CustomerMessage,
    AuthSession,
    Cart,
    ItemViewedLog,
    WishList,
    ItemReview,
    Address,
    SalesOrder,
    OrderDetail,
    PaymentLog
}

module.exports = Schema
