const AppSettings = require("./app-settings");

function calcDiscount(item, type) {
    const price = {
        price: item.price,
        oldPrice: item.price,
        discountStr: null,
        discountAmount: null
    }

    let discount = null

    if (type === 'Prime') {
        discount = item.discounts.find(d => d.customerType === 'Prime')
    }

    if (!discount) {
        discount = item.discounts.find(d => d.customerType === 'Normal')
    }

    if (discount && discount.discountValue) {
        price['oldPrice'] = price['price']

        const dvStr = getDiscountNumber(discount.discountValue);
        if (discount.discountType === 'Percent') {
            price['discountAmount'] = item['price'] * (discount.discountValue / 100);
            price['discountStr'] = `${dvStr}%`;
        } else {
            price['discountAmount'] = discount.discountValue;
            price['discountStr'] = `₹${dvStr}`;
        }
        price['price'] = price['oldPrice'] - price['discountAmount'];
    }

    return price
}

function getDiscountNumber(value) {
    if (!new RegExp(/^d+$/).test(value)) {
        return parseFloat(value).toFixed(0);
    }

    return parseFloat(value).toFixed(2);
}

function getRefundAmount(order) {
    if (!order.amountBalance >= 0) return null;
    const balance = -order.amountBalance;

    const settings = AppSettings.get([
        'payment.refund.fee.max',	// fee maximum (amount)
        'payment.refund.fee.min', // fee
        'payment.refund.fee.type' // fee type
    ]);

    if (settings['payment.refund.fee.min']) {
        let fee = settings['payment.refund.fee.min'];
        const type = settings['payment.refund.fee.type'] ?? 'Percent';
        const max = settings['payment.refund.fee.max'] ?? 0;

        if (type === 'Percent') {
            fee = (fee * balance) / 100;
        }

        if (max && fee > max) {
            fee = max;
        }

        return { balance, fee, amount: balance - fee }
    } else {
        return { balance, fee: 0, amount: balance }
    }
}

module.exports = {
    calcDiscount,
    getDiscountNumber,
    getRefundAmount
}
