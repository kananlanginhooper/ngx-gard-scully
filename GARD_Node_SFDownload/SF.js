const https = require('https');
const FormData = require('form-data');
const util = require('../SharedClasses/util');
const ServerUtil = require('./ServerUtil');
const async = require("async");
const DiseaseAttributes = require("../SharedClasses/DiseaseAttributes");

const diseaseAttributes = new DiseaseAttributes.DiseaseAttributes();

let JWT = null;
const InitialMainDataQueryURI = encodeURI('/services/data/v49.0/query/?q=select Name, Disease_Name_Full__c,DiseaseID__c from GARD_Disease__c');
let RawDiseaseRecords = [];
const MainDiseaseRecords = []

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
    FetchDataForMainQuery_SF(InitialMainDataQueryURI);
  });
}

FetchDataForMainQuery_SF = (DataURI) => {
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
  const req_data = https.request(options_data, callback_main_query_SF);
  req_data.on('error', function (error) {
    console.error('!!!');
    console.error(error);
    console.error('!!!');
    // retry
    setTimeout(FetchDataForMainQuery_SF.bind(null, DataURI), 5000);

  });
  req_data.end();
}

callback_main_query_SF = (response) => {
  let str = '';

  // another chunk of data has been received, so append it to `str`
  response.on('data', function (chunk) {
    str += chunk;
  });

  // the whole response has been received, so we just print it out here
  response.on('end', function () {
    const json = JSON.parse(str);

    // Save data to MainDiseaseRecords
    RawDiseaseRecords = RawDiseaseRecords.concat(json.records);

    if (ServerUtil.FetchAllData && !json.done) {
      // Fetch more data from pagination
      setTimeout(FetchDataForMainQuery_SF.bind(null, json.nextRecordsUrl), 100);
    } else {
      // All data has been fetched, now process all in one batch

      // to clean up data and add the Encoded name to the disease.json record
      RawDiseaseRecords.forEach((record, key, arr) => {
        if (record === undefined) {
          console.error('Record doesnt contain .Name', record);
        } else {
          if (!record.DiseaseID__c) {
            console.error(record.Name, 'is a test record');
          } else {
            MainDiseaseRecords.push({
              name: record.Name,
              EncodedName: util.Encode(record.Name),
              id: record.DiseaseID__c,
              DiseaseDetailURL: record.attributes.url
            });
          }
        }
      });

      const TextDataForDiseasesJson = JSON.stringify({
        'totalSize': RawDiseaseRecords.length,
        'records': RawDiseaseRecords
      });

      const KeyName = 'diseases.json';
      ServerUtil.UploadToS3(KeyName, TextDataForDiseasesJson
        , () => {
          console.error('!!! Error Writing main diseases.json to S3');
        }
        , () => {
          console.log('Diseases.json file has been saved, with', RawDiseaseRecords.length, 'records!');
        }
      );


      {
        // Save trimmed file for index creation
        const KeyNameTrimmed = 'diseases.trimmed.json';
        const TextDataForTrimmedDiseasesJson = JSON.stringify({
          'totalSize': MainDiseaseRecords.length,
          'records': MainDiseaseRecords.map(diseaseRecord => {
            return {
              id: diseaseRecord.id,
              name: diseaseRecord.name,
              EncodedName: diseaseRecord.EncodedName
            }
          })
        });

        ServerUtil.UploadToS3(KeyNameTrimmed, TextDataForTrimmedDiseasesJson
          , () => {
            console.error(`!!! Error Writing ${KeyNameTrimmed} to S3`);
          }
          , () => {
            console.log(`${KeyNameTrimmed} file has been saved, with`, MainDiseaseRecords.length, 'records!');
          }
        );
      }

      // after all processing on diseases.json is done...
      // Make secondary calls for each disease
      async.mapLimit(MainDiseaseRecords, ServerUtil.FetchThreads, async record => {
        if (record === undefined) {
          console.error('Record doesnt contain .Name', record);
        } else {

          { // Fetch Disease Detail Linked URL
            await FetchDataForSecondaryAsync_SF(record.DiseaseDetailURL)
              .then(response => {
                // all good
              }).catch(e => {
                // not so good
                if (e.ErrorReason && e.ErrorReason === 'Network') {
                  // need to reprocess
                  console.error('!!! Error in FetchDataForSecondary. Retry Now.',);
                  console.error(e);
                  console.error('!!!');

                  // retry
                  FetchDataForSecondaryAsync_SF(e.DataURI);
                } else if (e.ErrorReason && e.ErrorReason === 'S3') {
                  console.error('!!! S3 Error in callback_data_single:response.on.end');
                  console.error(e);
                  console.error('!!!');
                } else {
                  console.error(e);
                }

              });
          }

          { // All other Attributes linked to this Disease
            const GARD_DiseaseID = record.id;
            if (GARD_DiseaseID) {
              const url = encodeURI(`/services/apexrest/IntegrationServiceApi?term=${GARD_DiseaseID}`);
              await FetchAllOtherAttributesLinkedToThisDisease_SF(url)
                .then(response => {
                  // all good
                }).catch(e => {
                  // not so good
                  if (e.ErrorReason && e.ErrorReason === 'Network') {
                    // need to reprocess
                    console.error('!!! Error in FetchDataForSecondary. Retry Now.',);
                    console.error(e);
                    console.error('!!!');

                    // retry
                    FetchAllOtherAttributesLinkedToThisDisease_SF(e.DataURI);
                  } else if (e.ErrorReason && e.ErrorReason === 'S3') {
                    console.error('!!! S3 Error in callback_data_single:response.on.end');
                    console.error(e);
                    console.error('!!!');
                  } else {
                    console.error(e);
                  }
                });
            }
          }

        }
      }, (err, results) => {
        if (err) {
          console.error('Running Secondary Fetch, error:', err);
        } else {
          console.log('Secondary Fetch Complete', results.length, 'records');
          ServerUtil.WriteLocalLog(results.length);
        }
      });

    }

  });
}

async function FetchDataForSecondaryAsync_SF(DataURI) {
  return new Promise((resolve, reject) => {
    const options_data = {
      host: 'ncats--kbm.my.salesforce.com',
      path: DataURI,
      method: 'GET',
      timeout: 5000,
      headers: {
        'Authorization': `Bearer ${JWT}`
      }
    };
    const req_data = https.request(options_data, callback_data_single_SF.bind(null, resolve, reject));
    req_data.on('error', (error) => {
      reject({...error, ...{DataURI, ErrorReason: 'Network'}});
    });

    req_data.end();
  });
}

callback_data_single_SF = (resolve, reject, response) => {
  let str = '';

  //another chunk of data has been received, so append it to `str`
  response.on('data', function (chunk) {
    str += chunk;
  });

  //the whole response has been received, so we just print it out here
  response.on('end', function () {
    if (str && str.length) {
      try {
        let json = JSON.parse(str);
        const DiseaseID = json.DiseaseID__c;
        diseaseAttributes.AddFromDiseaseDetailFormat(json);
        const updatedSourceString = diseaseAttributes.GetDiseaseJsonString(DiseaseID);
        SaveDisease(DiseaseID, updatedSourceString);
      } catch (e) {
        reject({...e, ...{ErrorReason: 'S3'}});
      }
    }
    resolve();
  });
}

async function FetchAllOtherAttributesLinkedToThisDisease_SF(DataURI) {
  return new Promise((resolve, reject) => {
    const options_data = {
      host: 'ncats--kbm.my.salesforce.com',
      path: DataURI,
      method: 'GET',
      timeout: 5000,
      headers: {
        'Authorization': `Bearer ${JWT}`
      }
    };
    const req_data = https.request(options_data, callback_FetchAllOtherAttributesLinkedToThisDisease_SF.bind(null, resolve, reject));
    req_data.on('error', (error) => {
      reject({...error, ...{DataURI, ErrorReason: 'Network'}});
    });

    req_data.end();
  });
}

callback_FetchAllOtherAttributesLinkedToThisDisease_SF = (resolve, reject, response) => {
  let str = '';

  //another chunk of data has been received, so append it to `str`
  response.on('data', function (chunk) {
    str += chunk;
  });

  //the whole response has been received, so we just print it out here
  response.on('end', function () {
    if (str && str.length) {
      try {
        let json = JSON.parse(str);
        const DiseaseID = diseaseAttributes.AddFromAttributeListFormat(json);
        const updatedSourceString = diseaseAttributes.GetDiseaseJsonString(DiseaseID);
        SaveDisease(DiseaseID, updatedSourceString);
      } catch (e) {
        reject({...e, ...{ErrorReason: 'S3'}});
      }
    }
    resolve();
  });
}

SaveDisease = (DiseaseString, strJson) => {
  const arr = DiseaseString.split(':');
  const DiseaseID = arr[1];
  const KeyName = `singles/${DiseaseID}.json`;

  ServerUtil.UploadToS3(KeyName, strJson
    , () => {
      console.error('!!! Error Writing to S3', KeyName);
    }
    , () => {
      // console.log('Success for', KeyName);
    }
  );
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
