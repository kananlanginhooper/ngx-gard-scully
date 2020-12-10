#!/usr/bin/env node

const fs = require('fs');
const https = require('https');
const FormData = require('form-data');
const AWS = require('aws-sdk');
require('dotenv').config()

// Global Config
const FetchAllData = (process.env.FetchAllData === 'true'); // False = 500 records, True = 8000+
const AlsoWriteLocalJSONFiles = (process.env.AlsoWriteLocalJSONFiles === 'true');
const S3Bucket = process.env.bucket;

// Output settings so we can always be clear
console.log("FetchAllData:", FetchAllData);
console.log("AlsoWriteLocalJSONFiles:", AlsoWriteLocalJSONFiles);


// AWS Setup
AWS.config.update(
  {
    region: 'us-east-2',
    accessKeyId: process.env.accessKeyId,
    secretAccessKey: process.env.secretAccessKey
  }
); // us-east-2 is Ohio

const s3 = new AWS.S3({apiVersion: '2006-03-01'});

function Encode(str) {
  if (str === undefined) {
    return '';
  } else {
    const Encode1 = encodeURI(str.replace(/ /g, '_').replace(/:/g, '_').replace(/\//g, '_'));

    if (Encode1 === undefined) {
      console.error('!!! Encode - Undefined');
      return '';
    } else if (!Encode1) {
      console.error('!!! Encode - == false');
      return '';
    } else {
      return Encode1.replace('%E2%80%93', '');
    }
  }
}

async function wait(DelayInMs) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), DelayInMs)
  })
}

function UploadToS3(FileNameAKAKey, FileContentOrStream, Error, Success) {
  const uploadParams = {
    ACL: 'public-read',
    Bucket: 'gard-rarediseases-json',
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
        console.log(FileNameAKAKey, 'has been saved locally!');
      }
    });
  }
}

// setup for modern SSL
https.globalAgent.options.secureProtocol = 'TLSv1_2_method';

// Auth Form data
const formData_auth = new FormData();
formData_auth.append('username', 'gardweb.integration@nih.gov.qa');
formData_auth.append('client_id', process.env.client_id);
formData_auth.append('client_secret', process.env.client_secret);
formData_auth.append('password', process.env.password);
formData_auth.append('grant_type', 'password');

const options_auth = {
  host: 'ncats--qa.my.salesforce.com',
  path: '/services/oauth2/token',
  method: 'POST',
  headers: formData_auth.getHeaders()
};

let JWT = null;
const InitialMainDataQueryURI = encodeURI('/services/data/v49.0/query/?q=select Name, Disease_Name_Full__c, LastModifiedDate,DiseaseID__c,Synonyms_List__c,Disease_Type__c,Curation_List__c,Curation_Notes__c,Curation_Status__c,Disease_Categories__c,Gene_Reviews__c,Published_to_Website__c,Gard_External_ID__c from GARD_Disease__c');
let MainDiseaseRecords = [];

function FetchDataForMainQuery(DataURI) {
  console.log('Starting Main Data call:', DataURI);
  const options_data = {
    host: 'ncats--qa.my.salesforce.com',
    path: DataURI,
    method: 'GET',
    timeout: 5000,
    headers: {
      'Authorization': `Bearer ${JWT}`
    }
  };
  const req_data = https.request(options_data, callback_main_query);
  req_data.on('error', function (error) {
    console.error('!!!');
    console.error(error);
    console.error('!!!');
    // retry
    setTimeout(FetchDataForMainQuery.bind(null, DataURI), 5000);

  });
  req_data.end();
}

callback_auth = function (response) {
  let str = '';

  response.on('error', function (error) {
    console.error(error);
  });

  //another chunk of data has been received, so append it to `str`
  response.on('data', function (chunk) {
    str += chunk;
  });

  //the whole response has been received, so we just print it out here
  response.on('end', function () {
    const json = JSON.parse(str);
    JWT = json.access_token;
    console.log('JWT Fetched');
    FetchDataForMainQuery(InitialMainDataQueryURI);
  });
}

callback_main_query = function (response) {
  let str = '';

  // another chunk of data has been received, so append it to `str`
  response.on('data', function (chunk) {
    str += chunk;
  });

  // the whole response has been received, so we just print it out here
  response.on('end', function () {
    const json = JSON.parse(str);

    // Save data to MainDiseaseRecords
    MainDiseaseRecords = MainDiseaseRecords.concat(json.records);

    if (FetchAllData && !json.done) {
      // Fetch more data from pagination
      setTimeout(FetchDataForMainQuery.bind(null, json.nextRecordsUrl), 100);
    } else {
      // All data has been fetched, now process all in one batch

      // to clean up data and add the Encoded name to the disease.json record
      MainDiseaseRecords.forEach((record, key, arr) => {
        if (record === undefined) {
          console.error('Record doesnt contain .Name', record);
        } else {
          arr[key] = {...record, ...{EncodedName: Encode(record.Name)}};
        }
      });

      const TextDataForDiseasesJson = JSON.stringify({
        'totalSize': MainDiseaseRecords.length,
        'records': MainDiseaseRecords
      });

      const KeyName = 'diseases.json';
      UploadToS3(KeyName, TextDataForDiseasesJson
        , () => {
          console.error('!!! Error Writing main diseases.json to S3');
        }
        , () => {
          console.log('Diseases.json file has been saved, with', MainDiseaseRecords.length, 'records!');
        }
      );

      // after all processing on diseases.json is done...
      // Make secondary calls for each disease
      MainDiseaseRecords.forEach(record => {
        if (record === undefined) {
          console.error('Record doesnt contain .Name', record);
        } else {
          SecondaryCallsForDiseaseDetail(record.attributes.url).then();
        }
      });

    }

  });
}

async function SecondaryCallsForDiseaseDetail(SecondaryUrl) {
  const response = await wait(100);
  FetchDataForSecondary(SecondaryUrl);
}

function FetchDataForSecondary(DataURI) {
  const options_data = {
    host: 'ncats--qa.my.salesforce.com',
    path: DataURI,
    method: 'GET',
    timeout: 5000,
    headers: {
      'Authorization': `Bearer ${JWT}`
    }
  };
  const req_data = https.request(options_data, callback_data_single);
  req_data.on('error', function (error) {
    const retryIn = 10 + (Math.random() * 30);
    console.error('!!! Error in FetchDataForSecondary. Retry in', retryIn);
    console.error(error);
    console.error('!!!');

    // retry
    setTimeout(FetchDataForSecondary.bind(null, DataURI), retryIn);
  });
  req_data.end();
}

callback_data_single = function (response) {
  let str = '';

  //another chunk of data has been received, so append it to `str`
  response.on('data', function (chunk) {
    str += chunk;
  });

  //the whole response has been received, so we just print it out here
  response.on('end', function () {
    if (str && str.length) {
      try {
        const json = JSON.parse(str);
        const DiseaseName = Encode(json.Name);
        const KeyName = 'singles/' + DiseaseName + '.json';
        UploadToS3(KeyName, str
          , () => {
            console.error('!!! Error Writing to S3', KeyName);
          }
          , () => {
            // console.log('Success for', KeyName);
          }
        );
      } catch (e) {
        console.error('!!! Error in callback_data_single:response.on.end');
        console.error(e);
        console.error('!!!');
      }
    }
  });
}

// start Auth Call
const req_auth = https.request(options_auth, callback_auth);

// Add in form data
formData_auth.pipe(req_auth);
req_auth.on('error', function (e) {
  console.error(e);
});

// close AUTH connection
req_auth.end();





