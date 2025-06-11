require('dotenv').config();
const rootDir = require('./util/path');
const path = require('path');
const express = require('express')

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(rootDir, 'views/scripts')));

// View engine setup
app.set('view engine', 'ejs');

// Home route
app.get('/', (req, res) => {
    res.render('index');
});


const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
