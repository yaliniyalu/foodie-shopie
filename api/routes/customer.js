const {requiresAuth: auth} = require("../app/middlewares/auth-middleware");

const {CustomerApiController, AuthController, CartController, ItemController, OrderController} = require("../app/controllers/customer");
const {HomeWidgetController, GraphQlController, GeoCodeController} = require("../app/controllers/admin");
const {calcReviewInItem, transformTodayDeal} = require("../app/controllers/customer/item-controller");
const Schema = require("../app/tg-schema");
const router = require('express').Router();

function searchGuard(field) {
    return (req, res, next) => {
        req['filter'][field] = req.userId
        next()
    }
}

// Auth
router.post('/auth/login/firebase', AuthController.login)
router.get('/auth/me', auth, AuthController.getMe)
router.patch('/auth/me', AuthController.patchMe)
router.patch('/auth/me/fcm', AuthController.updateFcm)
router.post('/auth/refresh', auth, AuthController.refresh)
router.post('/auth/logout', AuthController.logout)

// Cart
router.get('/cart', auth, CartController.getCart)
router.post('/cart/item', auth, CartController.addToCart)
router.delete('/cart/item/:id', auth, CartController.deleteCartItem)
router.patch('/cart/item/:id/move', auth, CartController.moveToSaveLater)
router.get('/cart/location', CartController.getIsLocationDeliverable)
router.patch('/cart/coupon', CartController.applyCoupon)

// Save Later
router.delete('/wishlist', auth, CartController.removeFromSaveLater)
router.get('/wishlist', auth, CartController.getSaveLater)
router.post('/wishlist/move', auth, CartController.moveToCart)
router.post('/wishlist/toggle', auth, CartController.toggleSaveLater)

// Item
router.get('/item/view/log', ItemController.getLog)
router.get('/item/:id/related', ItemController.getRelated)

// Order
router.post('/order', OrderController.create)
router.post('/order/summary', OrderController.summary)
router.patch('/order/payment', OrderController.updatePayment)
router.post('/order/:id/cancel', OrderController.cancel)
router.post('/order/:id/pay', OrderController.createPaymentRequest)
router.post('/order/:id/pay/later', OrderController.payLater)
router.get('/order/:id?', searchGuard('_customerId'), OrderController.castParams, GraphQlController.search(Schema.SalesOrder.name, ['order', 'orders']))

router.get('/home', HomeWidgetController.getLive)
router.get('/category/all', CustomerApiController.getAllCategory)
router.get('/settings', CustomerApiController.getSettings)
router.get('/settings/privacy', CustomerApiController.getPrivacy)
router.get('/settings/terms', CustomerApiController.getTerms)
router.get('/settings/locations', CustomerApiController.getLocations)
router.post('/contact', CustomerApiController.createComplaint)
router.get('/review', GraphQlController.search(Schema.ItemReview.name, ['review', 'reviews']))
router.post('/review', CustomerApiController.createReview)
router.get('/geocode/location', GeoCodeController.getAddressByLocation)
router.get('/item/:id?',
    ItemController.addViewLog,
    ItemController.addArgs,
    GraphQlController.search('Item', ['item', 'items'], calcReviewInItem)
)
router.get('/featured-items',
    ItemController.addArgs,
    GraphQlController.search(Schema.TodayDeal.name, ['item', 'items'], transformTodayDeal)
)
router.get('/address', searchGuard('_customerId'), GraphQlController.search(Schema.Address.name, ['address', 'address']))

module.exports = router;
