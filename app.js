const express = require('express');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');  
const govRoutes = require('./routes/govRoutes');
const { govDB } = require('./config');
const Store = require('./models/Store');

const hbs = require('hbs');



const app = express();
const PORT = 4000;

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));


hbs.registerHelper('eq', function (a, b) {
    return a === b;
});

require('./helpers/priceChecker');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'gov_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

app.use('/', govRoutes);

app.listen(PORT, () => {
    console.log(`Government Body System running on http://localhost:${PORT}`);
});
