const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const multer = require('multer');
const bodyParser = require('body-parser');
const moment = require('moment');

const pjson = require('./package.json');

const app = express();
app.use(cors());
app.use(morgan('tiny'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const now = moment().format('YYYY-MM-DD');

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, '/tmp');
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${now}`);
  },
});

const upload = multer({ storage });

const port = process.env.PORT || 3100;

app.listen(port);

console.log(`=> Starting ${pjson.name}
=> Node ${pjson.engines.node} application starting in ${process.env.NODE_ENV
  || 'development'}
* Listening on http://localhost:${port}
* Environment: ${process.env.NODE_ENV || 'development'}
* Npm version: ${pjson.engines.npm}
${Object.keys(pjson.dependencies).reduce((acc, nxt) => `${acc}    ${nxt}: ${pjson.dependencies[nxt]}\n`, '* Dependencies:\n')}
Use Ctrl-C to stop`);

app.get('/', (req, res) => {
  res.send('OK');
});

app.post('/file', upload.single('file'), require('./file-route'));
