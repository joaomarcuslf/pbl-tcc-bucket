const moment = require('moment');
const AWS = require('aws-sdk');
const fs = require('fs');

AWS.config.update({ region: 'sa-east-1' });

const s3 = new AWS.S3({ apiVersion: '2006-03-01' });

async function getFileStream(file) {
  return new Promise((resolve) => {
    const fileStream = fs.createReadStream(file.path);

    fileStream.on('error', (err) => {
      console.log('ErrorMessage:', err);
      resolve([err, null]);
    });

    resolve([null, fileStream]);
  });
}

module.exports = async function fileServerRoute(req, res) {
  const { file } = req;
  const logs = [];

  if (!file) {
    const error = new Error('Please upload a file');
    error.httpStatusCode = 400;

    return res.status(error.httpStatusCode).json(error);
  }

  const uploadParams = { Bucket: 'pbl-tcc-bucket', Key: '', Body: '' };
  const fileName = file.originalname;

  const [errorOnFile, fileStream] = await getFileStream(file);

  if (errorOnFile) {
    console.log('ErrorMessage:', errorOnFile);
    return res.status(400).json({
      errors: [
        errorOnFile,
      ],
    });
  }

  uploadParams.Body = fileStream;


  const now = moment().format('YYYY-MM-DD');

  const fileArr = fileName.split('.');
  uploadParams.Key = `${fileArr[0]}-${now}.${fileArr[1]}`;

  s3.upload(uploadParams, (err, data) => {
    if (err) {
      console.log('ErrorMessage:', err);
      return res.status(400).json({
        errors: [
          err,
        ],
      });
    }

    return res.json({ ...file, location: data.Location });
  });

  return logs;
};
