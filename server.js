require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express()
const bodyParser = require('body-parser')
const urlValidator = require('valid-url')
const shortid = require('shortid')
// DB related
const connect = require('./db')
const Url = require('./userModel')

// Basic Configuration
const port = process.env.PORT || 3000

app.use(
  bodyParser.urlencoded({
    extended: false,
  })
)

app.use(cors())

app.use(express.json())

app.use('/public', express.static(`${process.cwd()}/public`))

// Connnect to remote mongodb database
connect()

app.get('/', (_, res) => {
  res.sendFile(process.cwd() + '/views/index.html')
})

// Your first API endpoint
app.get('/api/hello', (_, res) => {
  res.json({ greeting: 'hello API' })
})

// Get all urls
app.get('/api/allurls', async (_, res) => {
  try {
    const allUrls = await Url.find()
    res.json({
      message: 'All urls',
      data: allUrls,
    })
  } catch (e) {
    /* handle error */
    console.error(e.message)
  }
})

//@POST Creating new shortened url
app.post('/api/shorturl/new', async (req, res) => {
  try {
    const { url_input } = req.body
    let original_url = url_input
    let short_url = shortid.generate()
    let message = ''

    /*
     * Steps to create short_url
     * 1. Check if the url is present and its actually an url
     * 2. Check if the url is present in the urls collection
     * 3. If its present then send that short_url in response
     * 4. If the url is not present then generate new url and send it in response
     */

    // Step 1
    if (url_input && urlValidator.isWebUri(url_input)) {
      // Step 2
      let url = await Url.findOne({ original_url: url_input })

      // Step 3
      if (url) {
        // Send the already created short_url
        short_url = url.short_url
        message = 'url already present'
      } else {
        // Step 4
        let newUrl = new Url({
          original_url,
          short_url,
        })
        message = 'New url successfully created'
        await newUrl.save()
      }
      res.json({
        message,
        original_url: url_input,
        short_url,
      })
    } else {
      res.json({
        erro: 'invalid url',
      })
    }
  } catch (e) {
    /* handle error */
    console.error(e.message)
  }
})

//@GET Go to original url
app.get('/api/shorturl/:short_url', async (req, res) => {
  /*
   * Steps for redirecting to original url
   * 1. Take short_url from the request object
   * 2. find short_url in the Url collection
   * 3. If theres the url is present with the short_url then redirect to the original_url
   * 4. If short_url is not present then send response with error
   */
  try {
    const { short_url } = req.params
    res.json({
      message: 'test',
    })
    let original_url = ''

    if (short_url) {
      let url = await Url.findOne({
        short_url,
      })

      if (url) {
        original_url = url.original_url
      }
    }
    res.redirect(original_url)
  } catch (e) {
    /* handle error */
    console.error(e.message)
  }
})

app.post('/api/shorturl2', async (req, res) => {
  try {
    const { short_url } = req.body
    let original_url = ''

    if (short_url) {
      let url = await Url.findOne({
        short_url,
      })

      if (url) {
        original_url = url.original_url
      }
    }
    res.redirect(original_url)
  } catch (e) {
    /* handle error */
    console.error(e.message)
  }
})

app.listen(port, function () {
  console.log(`Listening on port ${port}`)
})
