const express = require("express");
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

require('./routes/index')(app);
require('./api/auth')(app);
require('./api/blog')(app);
require('./api/docs')(app);
require('./api/project')(app);
require('./api/user')(app);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server is running in port ${PORT}`));