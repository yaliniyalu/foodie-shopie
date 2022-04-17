const fs = require("fs");
const {createVertexQuery, createSID, createEdgeQuery} = require("../../app/tg-helpers");
const Schema = require("../../app/tg-schema");
const faker = require("@faker-js/faker").faker;

const ADMIN_ID = 'd6e226ed-e17f-415d-a241-c18d5587e2de'

const vertices = []
const edges = []


const categories = JSON.parse(fs.readFileSync(__dirname + '/category.json').toString())
const items = JSON.parse(fs.readFileSync(__dirname + '/items.json').toString())

for (const cat of categories) {
    const v = {
        _id: 'category-id-' + cat.name.toLowerCase(),
        isActive: true,
        image: '/uploads/category/' + cat.image,
        name: cat.name
    }

    vertices.push(createVertexQuery(Schema.Category, v._id, v))
    edges.push(createEdgeQuery(Schema.Category.edges.CATEGORY_CREATED_BY, v._id, ADMIN_ID, {time: new Date('2020-11-04T15:16').toISOString()}))
}

const parsedItem = []

for (const item of items) {
    let price = item.price.toString().split('.')
    price[0] += faker.datatype.number({min: 0, max: 9}).toString()
    price = parseFloat(price.join('.'))

    const discount1 = faker.datatype.number({min: 0, max: 20})
    const discount2 = faker.datatype.number({min: discount1, max: discount1 + 10})

    const categoryId = 'category-id-' + item.category.toLowerCase()
    const itemId = 'item-id-' + item.code

    const itemVertex = {
        _id: itemId,
        code: item.code,
        name: item.name,
        unit: item.unit,
        isPack: true,
        qtyPerSlice: 1,
        shortDescription: faker.commerce.productDescription(),
        isAvailable: true,
        price: Math.round((price * ((100 + discount1) / 100))),
        maintainStock: false,
        isActive: true,
        _categoryId: categoryId,
        createdAt: new Date('2020-11-04T15:16').toISOString()
    }

    const imageId = createSID(Schema.ItemImage.name, '/uploads/item/' + item.image)
    const imageVertex = {
        image: '/uploads/item/' + item.image,
        isDefault: true
    }

    parsedItem.push({
        id: itemId,
        categoryId: categoryId,
        name: item.name,
        price: itemVertex.price,
        discountNormal: discount1,
        discountPrime: discount2
    })

    const discountVertex1 = {
        discountType: 'Percent',
        discountValue: discount1,
        customerType: 'Normal'
    }
    const discountVertex2 = {
        discountType: 'Percent',
        discountValue: discount2,
        customerType: 'Prime'
    }
    const did1 = createSID(Schema.ItemDiscount.name, itemId, discountVertex1.customerType)
    const did2 = createSID(Schema.ItemDiscount.name, itemId, discountVertex2.customerType)

    vertices.push(createVertexQuery(Schema.Item, itemId, itemVertex))
    vertices.push(createVertexQuery(Schema.ItemImage, imageId, imageVertex))
    vertices.push(createVertexQuery(Schema.ItemDiscount, did1, discountVertex1))
    vertices.push(createVertexQuery(Schema.ItemDiscount, did2, discountVertex2))

    edges.push(createEdgeQuery(Schema.Item.edges.ITEM_CREATED_BY, itemId, ADMIN_ID, {time: new Date('2020-11-04T15:16').toISOString()}))
    edges.push(createEdgeQuery(Schema.Item.edges.ITEM_IN_CATEGORY, itemId, categoryId))
    edges.push(createEdgeQuery(Schema.Item.edges.ITEM_HAS_IMAGE, itemId, imageId))
    edges.push(createEdgeQuery(Schema.Item.edges.ITEM_HAS_DISCOUNT, itemId, did1))
    edges.push(createEdgeQuery(Schema.Item.edges.ITEM_HAS_DISCOUNT, itemId, did2))
}

fs.writeFileSync(__dirname + '/../json/items.json', JSON.stringify({vertices, edges}))
fs.writeFileSync(__dirname + '/../items.json', JSON.stringify(parsedItem))
