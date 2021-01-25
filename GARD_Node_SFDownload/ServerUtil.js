const execStart = new Date()
const fs = require('fs');
const https = require('https');

// import map from 'async/mapLimit';
const async = require('async');

const FetchThreads = process.env.FetchThreads || 100;  // Not actually threads, but max Async/Https calls made at once
const LogFileSave = (process.env.LogFileSave === 'true'); // True will write to console on each file write
const FetchAllData = (process.env.FetchAllData === 'true'); // False = 500 records, True = 8000+
const AlsoWriteLocalJSONFiles = (process.env.AlsoWriteLocalJSONFiles === 'true');
const LogFileName = process.env.LogFileName || '../fetch.log';
const S3Bucket = process.env.bucket;
const LegacyKey = process.env.LegacyKey;
const FetchMethod = process.env.FetchMethod;

// AWS Setup
const AWS = require('aws-sdk');
AWS.config.update(
  {
    region: 'us-east-2',
    accessKeyId: process.env.accessKeyId,
    secretAccessKey: process.env.secretAccessKey
  }
); // us-east-2 is Ohio


const s3 = new AWS.S3({apiVersion: '2006-03-01'});

// setup for modern SSL
https.globalAgent.options.secureProtocol = 'TLSv1_2_method';

function UploadToS3(FileNameAKAKey, FileContentOrStream, Error, Success) {
  const uploadParams = {
    ACL: 'public-read',
    Bucket: S3Bucket,
    Key: FileNameAKAKey,
    Body: FileContentOrStream
  };

  s3.upload(uploadParams, function (err, data) {
    if (err) {
      Error();
      console.log("Error", err);
    }
    if (data) {
      Success();
      // console.log("Upload Success", data.Location);
    }
  });

  if (AlsoWriteLocalJSONFiles) {
    fs.writeFile(FileNameAKAKey, FileContentOrStream, (err) => {
      if (err) {
        throw err;
      } else {
        if (LogFileSave) {
          console.log(FileNameAKAKey, 'has been saved locally!');
        }
      }
    });
  }
}

CreateFolders = () => {
  fs.mkdir('singles', () => { console.log('Singles created.')})
}

IsLegacyFetch = () => (FetchMethod === 'Legacy');


StartingOutput = () => {
  // Output settings so we can always be clear
  console.log("Fetching Data from:", IsLegacyFetch() ? 'Legacy' : 'Salesforce');
  console.log("FetchAllData:", FetchAllData);
  console.log("AlsoWriteLocalJSONFiles:", AlsoWriteLocalJSONFiles);
}

WriteLocalLog = (RecordCount) => {
  const json = {RecordCount, execTimeMs: new Date() - execStart};
  fs.writeFile(LogFileName, JSON.stringify(json), (err) => {
    if (err) {
      throw err;
    } else {
      console.log(LogFileName, 'has been saved locally!');
    }
  });
}

module.exports = {
  UploadToS3, CreateFolders, s3, FetchThreads, LogFileSave, FetchAllData, AlsoWriteLocalJSONFiles,
  LogFileName, S3Bucket, LegacyKey, IsLegacyFetch, StartingOutput, WriteLocalLog
}