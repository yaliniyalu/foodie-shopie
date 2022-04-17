const fs = require('fs').promises;
const path = require("path");
const {tgGraphQlExecute} = require("../../tg-helpers");
const {calcDiscount} = require("../../helpers/item-helper");

const FILE_BACKUP_DIR = path.resolve(process.env.UPLOAD_DIR, 'home', 'backup')
const FILE_LIVE_DIR = path.resolve(process.env.UPLOAD_DIR, 'home', 'live')
const FILE_TEMP_DIR = path.resolve(process.env.UPLOAD_DIR, 'temp')

const BACKUP_FILE = path.resolve(process.env.LOCAL_DIR, 'builder', 'backup.json')
const LIVE_FILE = path.resolve(process.env.LOCAL_DIR, 'builder', 'live.json')

const getLive = async (req, res) => {
    const customerType = req.query.customerType ?? 'Normal'
    const listLimit = req.query.listLimit ?? 1000

    try {
        const live = JSON.parse((await fs.readFile(LIVE_FILE)).toString())

        const itemIds = []
        const categoryIds = []

        for (const widget of live) {
            if (widget.type === 'item') {
                itemIds.push(...widget.list.map(v => v['item_id']))
            } else if (widget.type === 'category') {
                categoryIds.push(...widget.list.map(v => v['category_id']))
            }
        }

        const itemWhere = [... new Set(itemIds)].slice(0, listLimit).map(v => `(_id == \\"${v}\\")`).join(' OR ')
        const itemQuery = itemIds.length ? `
    Item(whereExpr: "${itemWhere}") {
      id
      name
      price
      ITEM_HAS_IMAGE {
        to {
          image
          isDefault
        }
      }
      ITEM_IN_CATEGORY {
        to {
          name
        }
      }
      ITEM_HAS_DISCOUNT {
        to {
          customerType
          discountType
          discountValue
        }
      }
    }` : '';

        const categoryWhere = [... new Set(categoryIds)].slice(0, listLimit).map(v => `(_id == \\"${v}\\")`).join(' OR ')
        const categoryQuery = categoryIds.length ? `
        Category(whereExpr: "${categoryWhere}") {
            id
            name
            image
            PARENT_CATEGORY {
                to {
                    name
                }
            }
        }
        ` : ''

        const query = `query { Ecommerce { ${itemQuery} ${categoryQuery} } }`
        const data = await tgGraphQlExecute(query)

        const itemMap = (data['Ecommerce']['Item'] ?? [])
            .map(item => {
                item.discounts = item.ITEM_HAS_DISCOUNT.map(v => v.to)
                return {
                    label: item.name,
                    value: item.id,
                    id: item.id,
                    name: item.name,
                    image: item.ITEM_HAS_IMAGE.find(v => v.to.isDefault)?.to.image,
                    category: item.ITEM_IN_CATEGORY[0]?.to.name,
                    price: calcDiscount(item, customerType)
                }
            })
            .reduce((acc, v) => {
                acc[v.id] = v
                return acc
            }, {})

        const categoryMap = (data['Ecommerce']['Category'] ?? [])
            .map(category => {
                return {
                    label: category.name,
                    value: category.id,
                    id: category.id,
                    name: category.name,
                    image: category.image,
                    parent: category.PARENT_CATEGORY[0]?.to.name
                }
            })
            .reduce((acc, v) => {
                acc[v.id] = v
                return acc
            }, {})

        for (const widget of live) {
            if (widget.type === 'item') {
                widget.list.forEach(v => v.item = itemMap[v['item_id']] ?? v.item)
            } else if (widget.type === 'category') {
                widget.list.forEach(v => v.category = categoryMap[v['category_id']] ?? v.category)
            }
        }

        res.json(live)
    } catch (e) {
        res.json([])
    }
}

async function cleanDirectory(directory) {
    try {
        await fs.readdir(directory).then((files) => Promise.all(files.map(file => fs.unlink(`${directory}/${file}`))));
    } catch(err) {
        console.log(err);
    }
}

async function fileExists(filename) {
    try {
        await fs.access(filename)
        return true
    } catch (e) {
        return false
    }
}

const saveLive = async (req, res) => {
    let backup = null
    try {
        backup = JSON.parse((await fs.readFile(BACKUP_FILE)).toString())
    } catch (e) {
        return res.sendError("No backup file")
    }

    const oldFiles = await fs.readdir(FILE_LIVE_DIR)
    const newFiles = []

    for (const widget of backup) {
        for (const list of widget.list) {
            if (!list.image) {
                continue;
            }

            const filename = list.image.substring(list.image.lastIndexOf('/') + 1);

            const fileLive = path.resolve(FILE_LIVE_DIR, filename)
            if (!await fileExists(fileLive)) {
                const fileBackup = path.resolve(FILE_BACKUP_DIR, filename)
                await fs.copyFile(fileBackup, fileLive)
            }

            newFiles.push(filename)

            list.image = '/uploads/home/live/' + filename
        }
    }

    try {
        await fs.writeFile(LIVE_FILE, JSON.stringify(backup))
    } catch (e) {
        return res.sendError("")
    }

    oldFiles.filter(x => !newFiles.includes(x)).forEach(v => fs.unlink(path.resolve(FILE_LIVE_DIR, v)))

    await cleanDirectory(FILE_BACKUP_DIR)
    await fs.unlink(BACKUP_FILE)

    res.send()
}

const saveBackup = async (req, res) => {
    for (const widget of req.body) {
        for (const list of widget.list) {
            if (!list.image) {
                continue;
            }

            const filename = list.image.substring(list.image.lastIndexOf('/') + 1);

            const fileBackup = path.resolve(FILE_BACKUP_DIR, filename)
            const fileTemp = path.resolve(FILE_TEMP_DIR, filename)
            const fileLive = path.resolve(FILE_LIVE_DIR, filename)

            if (!await fileExists(fileBackup)) {
                if (await fileExists(fileTemp)) {
                    await fs.copyFile(fileTemp, fileBackup)
                } else if (await fileExists(fileLive)) {
                    await fs.copyFile(fileLive, fileBackup)
                }
            }

            list.image = '/uploads/home/backup/' + filename
        }
    }

    try {
        await fs.writeFile(BACKUP_FILE, JSON.stringify(req.body))
    } catch (e) {
        return res.sendError("")
    }

    res.json(req.body)
}

const getBackup = async (req, res) => {
    try {
        const backup = JSON.parse((await fs.readFile(BACKUP_FILE)).toString())
        return res.status(200).json(backup)
    } catch (e) {
        return getLive(req, res)
    }
}


module.exports = {
    saveLive,
    saveBackup,
    getBackup,
    getLive
}
