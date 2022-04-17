const fs = require("fs");
const path = require("path");
const {getUploadedFileName} = require("../helpers");

const AppSettings = {
    settings: JSON.parse(fs.readFileSync(path.resolve(process.env.LOCAL_DIR, 'settings.json')).toString()),

    query(op, value) {
        let filtered = []
        switch (op) {
            case 'eq':
                filtered = this.settings.filter(v => v.id === value)
                break

            case 'in':
                filtered = this.settings.filter(v => value.includes(v.id))
                break

            case 'sw':
                filtered = this.settings.filter(v => v.id.startsWith(value))
                break
        }

        return filtered.map(v => ({id: v.id, value: this.castValue(v)}))
    },

    castValue(setting) {
        switch (setting.type) {
            case 'Number':
                return setting.value / 1;

            case "Boolean":
                return !!setting.value;

            default:
                return setting.value;
        }
    },

    get(keys) {
        if (!Array.isArray(keys)) {
            return this.query('eq', keys)[0].value
        }

        const settings = this.query('in', keys);

        return settings.reduce((acc, v) => {
            acc[v.id] = v.value
            return acc
        }, {})
    },

    set(id, value) {
        this.settings.find(v => v.id === id).value = value
    },

    async save() {
        this.settings.forEach(v => {
            if (v.type === 'File' && v.value) {
                v.value = getUploadedFileName(v.value, 'assets')
            }
        })

        await fs.writeFileSync(path.resolve(process.env.LOCAL_DIR, 'settings.json'), JSON.stringify(this.settings))
    }
}

module.exports = AppSettings
