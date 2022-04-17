const Joi = require("joi");
const {tgExecuteSearch} = require("../../search-query");
const Schema = require("../../tg-schema");
const {tgDeleteVertex, createVertexQuery, createEdgeQuery, tgUpsert, createSID} = require("../../tg-helpers");
const Cart = require('../../helpers/cart-helper')

async function getCart(req, res) {
    const cart = new Cart(req.user)
    res.sendSuccess({
        items: await cart.getItems()
    })
}

/**
 * @param req {CustomRequest}
 * @param res {CustomResponse}
 * */
async function addToCart(req, res) {
    const joiSchema = Joi.object({
        itemId: Joi.string().required(),
        qty: Joi.number().default(1),
        isUpdate: Joi.boolean().default(false),
    }).options({stripUnknown: true})

    const { error, value } = joiSchema.validate(req.body);
    if (error) {
        return res.sendError("Invalid Data", error)
    }

    await helper.addToCart(value.itemId, req.userId, value.qty, value.isUpdate, req, res)
}

async function deleteCartItem(req, res) {
    const id = req.params.id
    await tgDeleteVertex(Schema.Cart.name, id)
    res.sendSuccess({
        delete: [id],
        modify: {}
    })
}

const helper = {
    async addToSaveLater(_itemId, _customerId) {
        const iid = createSID(Schema.WishList.name, _itemId, _customerId)

        let obj = {
            _itemId,
            _customerId
        }

        const result = await tgExecuteSearch({filter: {_customerId, _itemId}}, Schema.WishList.name)
        if (result.length) {
            return
        }

        const vertex = createVertexQuery(Schema.WishList, iid, obj)
        const edges = []

        if (!result.length) {
            edges.push(
                createEdgeQuery(Schema.WishList.edges.WISHLIST_HAS_ITEM, iid, _itemId, {_customerId}),
                createEdgeQuery(Schema.Customer.edges.CUSTOMER_HAS_WISHLIST, _customerId, iid)
            )
        }

        await tgUpsert(vertex, edges)
    },

    async toggleSaveLater(_itemId, _customerId) {
        const result = await tgExecuteSearch({filter: {_customerId, _itemId}}, Schema.WishList.name)
        if (result.length) {
            await this.removeFromSaveLater(_itemId, _customerId)
            return 'remove'
        }

        await this.addToSaveLater(_itemId, _customerId)
        return 'add'
    },

    async removeFromSaveLater(_itemId, _customerId) {
        const iid = createSID(Schema.WishList.name, _itemId, _customerId)
        await tgDeleteVertex(Schema.WishList.name, iid)
    },

    async getCartItem(id) {
        const result = await tgExecuteSearch({filter: {_id: id}}, Schema.Cart.name)
        return result[0] ?? null
    },

    async addToCart(itemId, userId, qty, isUpdate, req = null, res = null) {
        let cart = {
            _id: createSID(Schema.Cart.name, itemId, userId),
            _itemId: itemId,
            _customerId: userId,
            qty,
        }

        const result = await tgExecuteSearch({filter: {_id: cart._id}}, Schema.Cart.name)
        if (result.length) {
            cart = result[0]
            cart._id = cart.id
            delete cart.id
        }

        if (isUpdate) {
            cart.qty = qty
        } else {
            cart.qty += qty
        }

        if (cart.qty <= 0) {
            await tgDeleteVertex(Schema.Cart.name, cart._id)
            if (res) {
                res.sendSuccess({
                    delete: cart._id,
                    modify: []
                })
            }
            return
        }

        const vertex = createVertexQuery(Schema.Cart, cart._id, cart)
        const edges = []

        if (!result.length) {
            edges.push(
                createEdgeQuery(Schema.Cart.edges.CART_HAS_ITEM, cart._id, cart._itemId, {_customerId: cart._customerId}),
                createEdgeQuery(Schema.Customer.edges.CUSTOMER_HAS_CART, cart._customerId, cart._id)
            )
        }

        await tgUpsert(vertex, edges)

        if (res) {
            const cartObj = new Cart(req.user, [cart._id], req.header('x-location'))
            res.sendSuccess({
                delete: [],
                modify: { [cart._id]: (await cartObj.getItems())[0] }
            })
        }
    }
}

async function moveToSaveLater(req, res) {
    const id = req.params.id
    const c = await helper.getCartItem(id)
    if (c) {
        await tgDeleteVertex(Schema.Cart.name, id)
        await helper.addToSaveLater(c._itemId, req.userId)
    }

    res.sendSuccess({
        delete: [id],
        modify: {}
    })
}

async function removeFromSaveLater(req, res) {
    await helper.removeFromSaveLater(req.query.itemId, req.userId)
    res.sendSuccess({})
}

async function moveToCart(req, res) {
    try {
        await helper.removeFromSaveLater(req.body.itemId, req.userId)
        await helper.addToCart(req.body.itemId, req.userId, 1, false)
    } catch (e) {
        return res.sendError('error')
    }
    res.sendSuccess({})
}

async function toggleSaveLater(req, res) {
    try {
        const action = await helper.toggleSaveLater(req.body.itemId, req.userId)
        res.sendSuccess({action})
    } catch (e) {
        return res.sendError('error')
    }
}

async function getSaveLater(req, res) {
    const data = await tgExecuteSearch({filter: {_customerId: req.userId}, include: 'item:id,name,price,isAvailable,stock,maintainStock;item.discounts;item.images'}, Schema.WishList.name)
    res.sendSuccess({
        wishlist: data.map(v => v.item)
    })
}

async function getIsLocationDeliverable(req, res) {
    const pincode = req.query['pincode']

    if (!pincode) {
        return res.sendError("Invalid Pincode");
    }

    const cart = new Cart(req.user,null, pincode);
    return res.sendSuccess(await cart.getDeliveryLocation());
}

async function applyCoupon(req, res) {
    const items = req.body['items']
    const coupon = req.body['coupon']

    try {
        const cart = new Cart(req.user, items, null, coupon)
        res.sendSuccess(await cart.getCouponDetails())
    } catch (e) {
        res.sendError(e.message)
    }
}

module.exports = {
    getCart,
    addToCart,
    deleteCartItem,
    moveToSaveLater,
    getSaveLater,
    removeFromSaveLater,
    moveToCart,
    toggleSaveLater,
    getIsLocationDeliverable,
    applyCoupon
}


