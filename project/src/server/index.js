require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const fetch = require('node-fetch')
const path = require('path')

const app = express()
const port = 3000

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/', express.static(path.join(__dirname, '../public')))

// your API calls

// Images + meta data : Mars Rover Photos: https://github.com/chrisccerami/mars-photo-api

//  Get Metadata from each rover according to the value specified "rover"
app.get('/rover-data/:rover', async (req, res) => {
    try {
        const rover = req.params.rover;
        const roverData = await fetch(`https://api.nasa.gov/mars-photos/api/v1/manifests/${rover}?api_key=${process.env.API_KEY}`)
            .then(res => res.json());
        res.send({ roverData });
    } catch(err) {
        console.log("error: ", err);
    }
})

// Photos API
app.get('/rover-photos/:rover', async (req, res) => {
    try {
        const rover = req.params.rover;
        const roverPhotos = await fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/${rover.toLowerCase()}/latest_photos?api_key=${process.env.API_KEY}`)
            .then(res => res.json());
            
        res.send({ roverPhotos });
    }catch(err) {
        console.log("Error in Photos: ", error);
    }

})

// example API call
app.get('/apod', async (req, res) => {
    try {
        const image = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${process.env.API_KEY}`)
            .then(res => res.json())
        res.send({ image })
    } catch (err) {
        console.log('error:', err);
    }
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))