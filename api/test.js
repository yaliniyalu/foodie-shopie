require('dotenv').config();

const api = require("./api");
const bcrypt = require("bcrypt");
const {createVertexQuery, createEdgeQuery, tgUpsert, tgDeleteVertex} = require("./app/tg-helpers");
const Schema = require("./app/tg-schema");
const {removeNull} = require("./app/helpers");
const {login} = require("./app/controllers/admin/auth-controller");

const createTokenTG = async () => {
    const data = await api.post('/requesttoken', {
        secret: process.env.TG_SECRET,
        graph: process.env.TG_GRAPH_NAME,
        lifetime: "7776000"
    })

    console.log(data.data)
}

/** @type {ExpressRequestHandler} */
const createDefaultAdmin = async () => {
    const id = "d6e226ed-e17f-415d-a241-c18d5587e2de"
    const passwordHash = await bcrypt.hash('123456', await bcrypt.genSalt(10));
    const user = {
        _id: id,
        name: 'Admin',
        email: 'admin@admin.com',
        phone: '987654321',
        password: passwordHash,
        isActive: true,
    }

    const vertex = createVertexQuery(Schema.User, id, user)
    const edges = [createEdgeQuery(Schema.User.edges.USER_CREATED_BY, id, id, { time: new Date().toISOString() })]

    try {
        await tgUpsert(vertex, edges)
        console.log(user)
    } catch (e) {
        console.log(e)
    }
}



/*tgDeleteVertex(Schema.Category.name, '').then(r => console.log(r)).catch(e => console.log(e))
tgDeleteVertex(Schema.Item.name, '').then(r => console.log(r)).catch(e => console.log(e))
tgDeleteVertex(Schema.ItemImage.name, '').then(r => console.log(r)).catch(e => console.log(e))
tgDeleteVertex(Schema.ItemDiscount.name, '').then(r => console.log(r)).catch(e => console.log(e))
tgDeleteVertex(Schema.TodayDeal.name, '').then(r => console.log(r)).catch(e => console.log(e))*/

/*
tgDeleteVertex(Schema.Location.name, '').then(r => console.log(r)).catch(e => console.log(e))
tgDeleteVertex(Schema.Address.name, '').then(r => console.log(r)).catch(e => console.log(e))
*/

// tgDeleteVertex(Schema.User.name, '9d944011-7dd6-4cda-987f-9856a89ab19e').then(r => console.log(r)).catch(e => console.log(e))
// tgDeleteVertex(Schema.User.name, '1206e409-1238-4755-b838-9ea279cc02d1').then(r => console.log(r)).catch(e => console.log(e))

// tgDeleteVertex(Schema.Customer.name, '').then(r => console.log(r)).catch(e => console.log(e))

tgDeleteVertex(Schema.Category.name, '4b3f694e-5d45-442a-ace0-57bbc511ff01').then(r => console.log(r)).catch(e => console.log(e))
