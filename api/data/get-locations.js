const puppeteer = require('puppeteer');
const fs = require("fs");

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const subPage = await browser.newPage()
    await page.goto('https://indiamapia.com/Kanyakumari.html');

    const locations = []

    const tr = await page.$$('body > .container-fluid > .row:nth-child(4) > div:nth-child(3) table > tbody tr')
    for (const el of tr) {
        const el2 = await el.$('td:nth-child(1) a')
        const name = await (await el2.getProperty('innerText')).jsonValue()
        const url = await (await el2.getProperty('href')).jsonValue()
        const pincode = await (await (await el.$('td:nth-child(2) a')).getProperty('innerText')).jsonValue()

        await subPage.goto(url)

        const latEl = await subPage.$('body > .container-fluid > .row:nth-child(4) > div:nth-child(1) table > tbody tr:nth-child(6) td:nth-child(2) b')
        const lngEl = await subPage.$('body > .container-fluid > .row:nth-child(4) > div:nth-child(1) table > tbody tr:nth-child(7) td:nth-child(2) b')

        const lat = await (await latEl.getProperty('innerText')).jsonValue()
        const lng = await (await lngEl.getProperty('innerText')).jsonValue()


        console.log(name, pincode, lat, lng)
        locations.push({name, pincode, lat, lng})
    }

    fs.writeFileSync(__dirname + '/json/' + 'locations.json', JSON.stringify(locations))

    await browser.close();
})();
