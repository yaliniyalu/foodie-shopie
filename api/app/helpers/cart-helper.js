const {calcDiscount, getDiscountNumber} = require("./item-helper");
const {tgExecuteCount, tgExecuteSearch} = require("../search-query");
const Schema = require("../tg-schema");
const {getLocationByPincode} = require("./geocode-helper");

class Cart {
    itemIds = [];
    location = null;
    coupon = null;

    items = null;
    deliveryLocationDetails = null;
    couponDetails = null;
    pricingDetails = null;

    customer = null

    constructor(customer, items = null, location = null, coupon = null) {
        this.itemIds = items
        this.location = location
        this.coupon = coupon
        this.customer = customer
    }

    fmod = function (a,b) { return Number((a - (Math.floor(a / b) * b)).toPrecision(8)); };

    async getItems() {
        if (this.items) {
            return this.items
        }

        const customer = this.customer;

        const query = {
            filter: {
                _customerId: customer.id,
            },
            include: 'item;item.images;item.discounts'
        }

        if (this.itemIds) {
            query.filter['_id'] = {in: this.itemIds}
        }

        const cart = await tgExecuteSearch(query, Schema.Cart.name);
        const items = [];

        for (const c of cart) {
            const item = c.item

            let stock = null
            if (!item.isActive || !item.isAvailable) {
                stock = null
            } else if (!item.maintainStock) {
                stock = -1;
            } else {
                stock = item.stock;
            }

            const price = calcDiscount(item, customer.customerType)

            let errorReason = null;
            if (!stock) {
                errorReason = 'Unavailable';
            } else if (!(stock === -1 || (stock >= item.qty))) {
                errorReason = "No stock available.";
            } else if (item.minOrderQty && item.qty < item.minOrderQty) {
                errorReason = `Minimum order qty is ${item.minOrderQty} ${item.unit}`;
            } else if (item.maxOrderQty && item.qty > item.maxOrderQty) {
                errorReason = `Maximum order qty is ${item.maxOrderQty} ${item.unit}`;
            } /*else if (item.qtyPerSlice > 0 && this.fmod(item.qty, item.qtyPerSlice) !== 0) {
                errorReason = `Invalid qty. The qty must be multiples of ${item.qtyPerSlice}`;
            }*/

            item.stock = stock
            item.price = price
            item.canPurchase = errorReason === null
            item.errorReason = errorReason

            item.image = item.images.find(v => v.isDefault)?.image

            delete item.images
            delete item.discounts

            items.push({
                id: c.id,
                item,
                qty: c.qty,
                totalAmount: c.qty * price.price,
                totalDiscount: c.qty * price.discountAmount
            })
        }

        this.items = items
        return items
    }

    sanitizeCoupon(coupon) {
         const c = {};
         const reject = ['isActive', 'createdBy', 'createdAt', 'updatedBy', 'updatedAt'];

        for (const [k, v] of Object.entries(coupon)) {
            if (reject.includes(k)) {
                continue
            }
            c[k] = v
        }

        const dvStr = getDiscountNumber(c['discountValue']);
        if (c['discountType'] === 'Percent') {
            c['discountStr'] = `${dvStr}%`;
        } else {
            c['discountStr'] = `₹${dvStr}`;
        }

        return c;
    }

    async getTotalOrderValue() {
        await this.getItems();
        return this.items.reduce((total, item) => total + item['totalAmount'], 0)
    }

    async getPricingDetails() {
        if (this.pricingDetails) {
            return this.pricingDetails;
        }

        await this.getItems();
        await this.getDeliveryLocation();
        await this.getCouponDetails();

        const deliveryCharge = this.deliveryLocationDetails['fee'] ?? 0;
        const deliveryTotal = deliveryCharge;
        const couponDiscount = this.couponDetails ? (this.couponDetails['discountAmount'] ?? 0) : 0;

        let realTotal = 0;

        let subTotal = 0;
        let totalDiscount = 0;

        this.items.forEach(item => {
            realTotal += item['totalAmount'];
            subTotal += item['totalAmount'] + item['totalDiscount'];
            totalDiscount += item['totalDiscount'];
        })

        const grandTotal = (realTotal - couponDiscount) + deliveryTotal;
        this.pricingDetails = {
            subTotal, totalDiscount, deliveryCharge, couponDiscount, grandTotal, deliveryTotal
        }

        return this.pricingDetails;
    }

    async getCouponDetails() {
        if (this.couponDetails) {
            return this.couponDetails;
        }

        if (!this.coupon) {
            return null;
        }

        let coupon = await tgExecuteSearch({filter: {code: this.coupon, isActive: true}}, Schema.Coupon.name)

        if (!coupon.length) {
            return {
                coupon: this.coupon,
                status: 'INVALID',
                message: "Promo Code is Invalid"
            }
        }

        coupon = coupon[0];

        if (coupon.expiresOn) {
            const exp = new Date(coupon.expiresOn)
            if (exp < new Date()) {
                return {
                    coupon: coupon.code,
                    status: 'EXPIRED',
                    message: "Promo Code Expired"
                }
            }
        }

/*        if (coupon.usageLimit) {
            const count = await tgExecuteCount({filter: {_customerId: this.customer.id, _id: coupon.id, isActive: true}}, Schema.C)

            if (count >= coupon.usageLimit) {
                return {
                    coupon: coupon.code,
                    status: 'USAGE_LIMIT_EXCEEDED',
                    message: "You have already used this Promo Code"
                }
            }
        }*/

        if (coupon.customerType !== 'Normal') {
            if (coupon.customerType !== this.customer.customerType) {
                return {
                    coupon: coupon.code,
                    status: 'REQ_CUSTOMER',
                    message: `Only applied for ${coupon.customerType} members`
                }
            }
        }

        const orderValue = await this.getTotalOrderValue();

        if (coupon.minOrderValue) {
            if (orderValue < coupon.minOrderValue) {
                return {
                    coupon: coupon.code,
                    status: 'REQ_MIN_ORDER_VALUE',
                    message: `Order Value must be greater than ₹${coupon.minOrderValue}`
                }
            }
        }

        let discountAmount = 0;
        if (coupon.discountType === 'Amount') {
            discountAmount = coupon.discountValue;
        } else {
            discountAmount = orderValue * (coupon.discountValue / 100);

            if (coupon.maxDiscountValue) {
                discountAmount = Math.min(discountAmount, coupon.maxDiscountValue);
            }
        }

        this.couponDetails = {
            coupon: this.sanitizeCoupon(coupon),
            status: 'APPLIED',
            discountAmount
        }

        return this.couponDetails;
    }

    async getDeliveryLocation() {
        if (this.deliveryLocationDetails) {
            return this.deliveryLocationDetails;
        }

        const delivery = {
            isDeliverable: false,
            location: {
                name: null,
                pincode: this.location
            },
            fee: null
        }

        this.deliveryLocationDetails = delivery;

        if (!this.location) {
            return delivery;
        }

        const data = await tgExecuteSearch({filter: {isActive: true, pincode: this.location}}, Schema.Location.name)

        if (!data.length) {
            try {
                delivery['location']['name'] = await getLocationByPincode(this.location)['location']['Name'];
            } catch (e) {
            }
            return delivery;
        }

        delivery.isDeliverable = true;
        delivery.location.name = data[0]['name'];
        delivery.fee = data[0]['fee'];

        this.deliveryLocationDetails = delivery;
        return delivery;
    }
}


module.exports = Cart
