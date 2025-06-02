const http = require('http');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const express = require('express');
const config = require('../config/config');

const Auth = require('./routes/auth');
const Lists = require('./routes/lists');
const Tasks = require('./routes/tasks');

const app = express();
const server = http.createServer(app);

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/auth', Auth);
app.use('/lists', Lists);
app.use('/tasks', Tasks);

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

function startServer(port = null) {
    port = port || config.port;
    server.listen(port, () => console.log(`Server is running at http://localhost:${port}`));
}

module.exports = startServer;