const puppeteer = require('puppeteer')
const express = require('express')
const r = require('@mozilla/readability')
const jsdom = require('jsdom')
const genericPool = require('generic-pool')
const { JSDOM } = jsdom

let myPool
let browser
const opts = {
  max: 10, // maximum size of the pool
  min: 2, // minimum size of the pool,
  maxWaitingClients: 30,
  evictionRunIntervalMillis: 30000
}

const init = async () => {
  browser = await puppeteer.launch({
    headless: true,
    args: [
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--disable-setuid-sandbox',
      '--no-sandbox',
      '--single-process',
      '--js-flags=--expose-gc',
      '--no-zygote',
      '--no-zygote-sandbox'
      // '--remote-debugging-port=9222'
    ]
  })

  const factory = browser => {
    return {
      create: function () {
        return browser.newPage()
      },
      destroy: function (page) {
        page.close()
      }
    }
  }
  myPool = genericPool.createPool(factory(browser), opts)
}
init()
const app = express()
// let browser
let browserWSEndpoint
// const createBrowser = async () => {
//   try {
//     const browser = await puppeteer.launch({
//       args: ['--no-sandbox', '--disable-setuid-sandbox']
//     })
//     browserWSEndpoint = browser.wsEndpoint()
//   } catch (err) {
//     console.log(err)
//   } finally {
//     console.log(browserWSEndpoint)
//   }
// }

// createBrowser()

app.get('/', async (req, res) => {
  try {
    const { url } = req.query
    if (!url) {
      res.type('text/html')
      return res.end('You need to specify <code>url</code> query parameter')
    }

    // const url = 'https://namu.wiki/w/%EB%8C%80%EC%A0%84%EC%9A%B4%EC%88%98'

    const page = await browser.newPage()
    const start = new Date()
    page.setExtraHTTPHeaders({
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36'
    })
    const waitCondition = url.includes('notion.so') ? 'networkidle0' : 'load'
    await page.goto(url, { waitUntil: waitCondition, timeout: 0 })
    await page.screenshot({ path: 'fullpage.png', fullPage: true })

    const body = await page.evaluate(node => {
      return document.querySelector('html').innerHTML
    })
    const end = new Date()
    const { document } = new JSDOM(body).window
    var article = new r.Readability(document).parse()
    console.log(`took ${(end - start) / 1000} seconds`)
    res.status(200).send(body)
    // await browser.close()
  } catch (error) {
    console.log(error.message)
    return res.status(500).send()
  } finally {
  }
})
app.listen(8080)
console.log('listening on 8080')
