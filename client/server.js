// yarn add express cors body-parser
const express = require('express');
const bodyParser = require('body-parser');

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.static('build'));


app.listen(PORT, () => console.log(`Server listening on port ${PORT}!`));

