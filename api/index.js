const http = require('http');
const cors = require('cors');
const express = require('express');
const config = require('../config/config');
const supabase = require('../db/supabaseClient');

const Auth = require('./routes/auth');

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

app.get('/', async (req, res) => {
    res.send(`
        <!DOCKTYPE html>
        <html lang="en">
            <head>
                <meta charset="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta
                    name="description"
                    content="Welcome page from the server"
                />
                <title>Welcome</title>
                <style>
                    * {
                        text-align: center;
                        margin: 100px;
                    }

                    body { padding-top: 40px; gap: 20px; }
                </style>
            </head>
            <body>
                <h1>Hello from the server!</h1>
            </body>
        </html>
    `);
});

app.use('/auth', Auth);

function startServer(port = null) {
    port = port || config.port;
    server.listen(port, () => console.log(`Server is running at http://localhost:${port}`));
}

module.exports = startServer;