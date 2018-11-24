const express = require('express');

var app = express();

app.get('/', (request, response) => {
    response.send('tenks for pinging me');
});

app.listen(process.env.PORT);
