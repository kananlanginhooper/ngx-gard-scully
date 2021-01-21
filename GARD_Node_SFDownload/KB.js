const https = require('https');
const FormData = require('form-data');
const util = require('./util');
const async = require("async");

let JWT = null;
const InitialMainDataQueryURI = encodeURI('/services/data/v49.0/parameterizedSearch/?q=gene&sobject=Knowledge__kav&Knowledge__kav.where=language=\'en_US\'+and+publishStatus=\'online\'&Knowledge__kav.fields=id,title,Summary__c&dataCategory=Guides__c+AT+Genetic_Disease__c');
let RawKBRecords = [];
const MainKBRecords = []

callback_auth = (response) => {
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

FetchDataForMainQuery = (DataURI) => {
  console.log('Starting Main Data call:', DataURI);
  const options_data = {
    host: 'ncats--kbm.my.salesforce.com',
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

callback_main_query = (response) => {
  let str = '';

  // another chunk of data has been received, so append it to `str`
  response.on('data', function (chunk) {
    str += chunk;
  });

  // the whole response has been received, so we just print it out here
  response.on('end', function () {
    const json = JSON.parse(str);

    // Save data to MainDiseaseRecords
    RawKBRecords = RawKBRecords.concat(json.searchRecords);

    if (util.FetchAllData && !json.done) {
      // Fetch more data from pagination
      setTimeout(FetchDataForMainQuery.bind(null, json.nextRecordsUrl), 100);
    } else {
      // All data has been fetched, now process all in one batch

      // to clean up data and add the Encoded name to the disease.json record
      RawKBRecords.forEach((record, key, arr) => {
        if (record === undefined) {
          console.error('Record not found', record);
        } else {
          MainKBRecords.push({
            id: record.Id,
            title: record.Title,
            summary: record.Summary__c
          });
        }
      });

      const TextDataForDiseasesJson = JSON.stringify({
        'totalSize': MainKBRecords.length,
        'records': MainKBRecords
      });

      const KeyName = 'diseases.KB.json';
      util.UploadToS3(KeyName, TextDataForDiseasesJson
        , () => {
          console.error('!!! Error Writing diseases.KB.json to S3');
        }
        , () => {
          console.log('Diseases.KB.json file has been saved, with', MainKBRecords.length, 'records!');
        }
      );
    }
  });
}

RunFetch = () => {

// Auth Form data
  const formData_auth = new FormData();
  formData_auth.append('username', 'gardweb.integration@nih.gov.kbm');
  formData_auth.append('client_id', process.env.client_id);
  formData_auth.append('client_secret', process.env.client_secret);
  formData_auth.append('password', process.env.password);
  formData_auth.append('grant_type', 'password');

  const options_auth = {
    host: 'ncats--kbm.my.salesforce.com',
    path: '/services/oauth2/token',
    method: 'POST',
    headers: formData_auth.getHeaders()
  };

// start Auth Call
  const req_auth = https.request(options_auth, callback_auth);

// Add in form data
  formData_auth.pipe(req_auth);
  req_auth.on('error', function (e) {
    console.error(e);
  });

// close AUTH connection
  req_auth.end();
}

module.exports = {
  RunFetch
}
