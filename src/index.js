import 'dotenv/config';
import express from 'express';
import locRepo from './repos/locRepo.js';
import https from 'https';
import fs from 'fs';

console.log('Starting server');
const app = express();

let router = express.Router();
router.get('/api/loc', function (req, res) {
    locRepo.lastPlace().then((result) => {
        res.status(200).json({
            "status": 200,
            "statusText": "OK",
            "message": "Location retrieved.",
            "data": result
        });
    });
});

router.get('/', (req, res) => {
    locRepo.lastPlace().then((result) => {
        res.render('index', { message: 'Hello there!', location: result })
    })
});

router.get('/set', (req, res) => {
    res.render('set');
});

router.post("/set", (req, res) => {
    const lat = parseFloat(req.query.lat);
    const long = parseFloat(req.query.long);
    
    if(!lat || !long) {
        res.status(400).json({
            "status": 400,
            "statusText": "Error",
            "message": "Bad Request",
        });
    } else {
    locRepo.set(req.query.lat, req.query.long);
    res.status(200).json({
        "status": 200,
        "statusText": "OK",
        "message": "Location set.",
    }
    );}
})

app.use('/', router);
app.set('view engine', 'pug')

const server = https.createServer({
    key: fs.readFileSync(`localhost-key.pem`, 'utf8'),
    cert: fs.readFileSync(`localhost.pem`, 'utf8')
}, app);

if (process.env.NODE_ENV !== 'production') {
    server.listen(process.env.PORT, () =>
        console.log(`App listening on port ${process.env.PORT}`),
    );
} else {
    app.listen(process.env.PORT, () =>
        console.log(`App listening on port ${process.env.PORT}`),
    );
}
