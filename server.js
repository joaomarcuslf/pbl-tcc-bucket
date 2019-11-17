var express = require("express");
var morgan = require("morgan");
var cors = require("cors");
var moment = require("moment");
var multer = require("multer");
var bodyParser = require("body-parser");
var AWS = require("aws-sdk");

AWS.config.update({ region: "sa-east-1" });

var pjson = require("./package.json");

var app = express();
app.use(cors());
app.use(morgan("tiny"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(bodyParser.urlencoded({ extended: true }));

var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "/tmp");
  },
  filename: function(req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now());
  }
});

var upload = multer({ storage: storage });

var port = process.env.PORT || 3100;

app.listen(port);

console.log(`=> Starting ${pjson.name}
=> Node ${pjson.engines.node} application starting in ${process.env.NODE_ENV ||
  "development"}
* Listening on http://localhost:${port}
* Environment: ${process.env.NODE_ENV || "development"}
* Npm version: ${pjson.engines.npm}
${Object.keys(pjson.dependencies).reduce((acc, nxt) => {
  return acc + `    ${nxt}: ${pjson.dependencies[nxt]}\n`;
}, "* Dependencies:\n")}
Use Ctrl-C to stop`);

s3 = new AWS.S3({ apiVersion: "2006-03-01" });

app.get("/", function(req, res) {
  res.send("OK");
});

app.post("/file", upload.single("file"), function(req, res, next) {
  const file = req.file;
  if (!file) {
    const error = new Error("Please upload a file");
    error.httpStatusCode = 400;
    return next(error);
  }

  var uploadParams = { Bucket: "pbl-tcc-bucket", Key: "", Body: "" };
  var fileName = file.originalname;

  var fs = require("fs");

  var fileStream = fs.createReadStream(file.path);

  fileStream.on("error", function(err) {
    res.status(400).json(err);
  });

  uploadParams.Body = fileStream;

  var path = require("path");

  var now = moment().format();

  const fileArr = fileName.split(".");
  uploadParams.Key = `${fileArr[0]}-${now}.${fileArr[1]}`;

  s3.upload(uploadParams, function(err, data) {
    if (err) {
      res.status(400).json(err);
    }
    if (data) {
      res.json(Object.assign({}, file, { location: data.Location }));
    }
  });
});
