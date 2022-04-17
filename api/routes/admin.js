const {requiresAuth} = require("../app/middlewares/auth-middleware");
const path = require("path");
const uuid = require('uuid');
const multer = require("multer");
const {AuthController, GraphQlController, CategoryController, CouponController, AccountController, ItemController,
    TodayDealsController, LocationController, HomeWidgetController, AppSettingController, UploadController,
    CustomerController, ReviewController, OrderController, DashboardController, AnalyticsController, MessageController
} = require("../app/controllers/admin");
const Schema = require("../app/tg-schema");
const routerNoAuth = require('express').Router();

routerNoAuth.post('/auth/login', AuthController.login)
routerNoAuth.post('/auth/logout', AuthController.logout)
routerNoAuth.get('/geocode/location', () => '')


const router = require('express').Router();

router.get('/auth/me', AuthController.getMe)
router.patch('/auth/me', AuthController.patchMe)
router.patch('/auth/me/password', AuthController.updatePassword)

router.post('/graphql', GraphQlController.graphql);

// Category
router.get('/category/:id?', GraphQlController.search('Category', ['category', 'category']))
router.post('/category', CategoryController.create)
router.patch('/category/:id', CategoryController.patch)

// Coupon
router.get('/coupon/:id?', GraphQlController.search('Coupon', ['coupon', 'coupons']))
router.post('/coupon', CouponController.create)
router.patch('/coupon/:id', CouponController.patch)

// Account
router.get('/account/:id?', GraphQlController.search('User', ['account', 'accounts']))
router.post('/account', AccountController.create)
router.patch('/account/:id', AccountController.patch)

// Item
router.get('/item/:id?', GraphQlController.search('Item', ['item', 'items']))
router.post('/item', ItemController.create)
router.patch('/item/:id/basic', ItemController.patchBasic)
router.patch('/item/:id/stock', ItemController.patchStock)
router.patch('/item/:id/unit', ItemController.patchUnit)
router.patch('/item/:id/status', ItemController.patchStatus)
router.patch('/item/:id/image', ItemController.patchImage)
router.patch('/item/:id/discounts', ItemController.patchDiscounts)

// Today Deals
router.get('/today-deals/:id?', GraphQlController.search('TodayDeal', ['todayDeal', 'todayDeals']))
router.post('/today-deals', TodayDealsController.create)
router.delete('/today-deals/:id', TodayDealsController.remove)

// Location
router.get('/location/:id?', GraphQlController.search('Location', ['location', 'locations']))
router.post('/location', LocationController.create)
router.patch('/location/:id', LocationController.patch)

// Home Widget
router.get('/home-widget/backup', HomeWidgetController.getBackup)
router.post('/home-widget/backup', HomeWidgetController.saveBackup)
router.post('/home-widget', HomeWidgetController.saveLive)

// App Settings
router.get('/app-setting/:id?', AppSettingController.get)
router.put('/app-setting', AppSettingController.update)

// Customer
router.get('/customer/:id?', GraphQlController.search('Customer', ['customer', 'customers']))
router.patch('/customer/:id', CustomerController.patch)

// Review
router.get('/review/:id?', GraphQlController.search(Schema.ItemReview.name, ['review', 'reviews']))
router.patch('/review/:id/status', ReviewController.patchStatus)
router.delete('/review/:id', ReviewController.deleteReview)

// Message
router.get('/message/:id?', GraphQlController.search(Schema.CustomerMessage.name, ['message', 'messages']))
router.patch('/message/:id', MessageController.patch)
router.delete('/message/:id', MessageController.deleteMessage)

// Order
router.get('/order/:id?', GraphQlController.search(Schema.SalesOrder.name, ['order', 'orders']))
router.delete('/order/:id/assigned', OrderController.removedAssignedUser)
router.patch('/order/:id/assign/:user', OrderController.assignOrder)
router.patch('/order/:id/status', OrderController.updateStatus)
router.patch('/order/:id/item/:detail/status', OrderController.patchItemStatus)
router.patch('/order/:id/payment', OrderController.patchPayment)

// Dashboard
router.get('/notifications', DashboardController.getNotification)
router.get('/dashboard', DashboardController.getDashboard)
router.post('/analytics', AnalyticsController.getAnalytics)
router.post('/analytics/table', AnalyticsController.getAnalyticsTable)

// Upload --->
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, process.env.UPLOAD_DIR  + '/temp/'),
    filename: (req, file, cb) => cb(null, uuid.v4() + path.extname(file['originalname']))
})
const upload = multer({ storage: storage })

router.post('/upload', upload.single('file'), UploadController.upload)
router.delete('/upload', UploadController.remove)
// <--- Upload

routerNoAuth.use('', requiresAuth, router)

module.exports = routerNoAuth;
