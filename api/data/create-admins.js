const {createUID, createVertexQuery, createEdgeQuery} = require("../app/tg-helpers");
const Schema = require("../app/tg-schema");
const bcrypt = require("bcrypt");
const fs = require("fs");
const faker = require("@faker-js/faker").faker;
const ADMIN_ID = 'd6e226ed-e17f-415d-a241-c18d5587e2de'

const vertexes = []
const edges = []

async function create() {
   /* vertexes.push(createVertexQuery(Schema.User, ADMIN_ID, {
        _id: ADMIN_ID,
        name: 'Admin',
        email: 'admin@admin.com',
        password: await getPassword('123456'),
        image: 'admin-avatar.jpg',
        phone: '8508332176',
        isActive: true,
    }))

    edges.push(createEdgeQuery(Schema.User.edges.USER_CREATED_BY, ADMIN_ID, ADMIN_ID, {time: new Date('2020-04-11T15:16').toISOString()}))
*/
    for (let i = 0; i < 50; i++) {
        const id = createUID()
        const acc = getUniqueAccount()

        vertexes.push(createVertexQuery(Schema.User, id, {
            _id: id,
            ...acc,
            password: await getPassword(faker.random.alphaNumeric(6)),
            isActive: true,
        }))

        edges.push(createEdgeQuery(Schema.User.edges.USER_CREATED_BY, id, ADMIN_ID, {time: new Date('2020-04-11T15:16').toISOString()}))
    }

    fs.writeFileSync(__dirname + '/json/accounts.json', JSON.stringify({vertexes, edges}))
}

const emails = ['admin@admin.com']
function getUniqueAccount() {
    while (true) {
        const f_name = faker.name.firstName()
        const l_name = faker.name.lastName()
        const name = faker.name.findName(f_name, l_name)
        const phone = faker.phone.phoneNumber('##########')
        const email = faker.internet.email(f_name, l_name)
        const image = faker.image.avatar()

        if (emails.includes(email)) {
            continue
        }

        emails.push(email)
        return {
            name, phone, email, image
        }
    }
}

async function getPassword(password) {
    return await bcrypt.hash(password, await bcrypt.genSalt(10));
}

create().finally(_ => process.exit())
