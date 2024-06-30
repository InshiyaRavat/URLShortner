const express = require('express');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const cors = require('cors');
const axios = require('axios');
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({
    origin: ["http://localhost:3000","https://urlshortner-frontend-0k74.onrender.com"],
    methods: ['GET', 'POST', 'DELETE', 'PUT']
}));
const port = process.env.PORT || 6000;
const mongoURL = process.env.MONGO_URL;
const client = new MongoClient(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true });
let db;

app.use(express.urlencoded({ extended: true }));

client.connect()
    .then(() => {
        db = client.db('urlshortner');
        console.log("connected to atlas db");
    })
    .catch(err => {
        console.log(err);
        console.log("couldn't connect to atlas db");
    });

async function generateShortID() {
    let shortID;
    let url;
    do {
        shortID = Math.random().toString(36).substring(2, 8);
        url = await db.collection('urls').findOne({ shortID });
    } while (url);

    return shortID;
}

app.post('/shorten', async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ error: "URL is required" });
        }
        const shortID = await generateShortID();
        await db.collection('urls').insertOne({ shortID, url });
        res.json(shortID);
    } catch (error) {
        console.error("Error in /shorten:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get('/:shortID', async (req, res) => {
    try {
        const shortID = req.params.shortID;
        const urlData = await db.collection('urls').findOne({ shortID });

        if (urlData) {
            const { url } = urlData;
            try {
                const response = await axios.get(url, { responseType: 'stream' });
                response.data.pipe(res);
            } catch (error) {
                console.error("Error fetching the URL:", error);
                res.status(500).send("Error fetching the URL");
            }
        } else {
            res.status(404).send("URL not found");
        }
    } catch (error) {
        console.error("Error in /:shortID:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.listen(port, () => {
    console.log(`server is listening on port ${port}`);
});
