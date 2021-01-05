#!/usr/bin/env node

const execStart = new Date()
const fs = require('fs');
const https = require('https');
const FormData = require('form-data');
const AWS = require('aws-sdk');
require('dotenv').config()
// import map from 'async/mapLimit';
const async = require('async');

// Global Config
const Legacy = true;
const FetchThreads = process.env.FetchThreads || 100;  // Not actually threads, but max Async/Https calls made at once
const LogFileSave = (process.env.LogFileSave === 'true'); // True will write to console on each file write
const FetchAllData = (process.env.FetchAllData === 'true'); // False = 500 records, True = 8000+
const AlsoWriteLocalJSONFiles = (process.env.AlsoWriteLocalJSONFiles === 'true');
const LogFileName = process.env.LogFileName || '../fetch.log';
const S3Bucket = process.env.bucket;
const LegacyKey = process.env.LegacyKey;

// Output settings so we can always be clear
console.log("Fetching Data from:", Legacy ? 'Legacy' : 'Salesforce');
console.log("FetchAllData:", FetchAllData);
console.log("AlsoWriteLocalJSONFiles:", AlsoWriteLocalJSONFiles);

// setup for modern SSL
https.globalAgent.options.secureProtocol = 'TLSv1_2_method';

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


if (Legacy) {

  FetchDataForMainQuery = (DataURI) => {
    console.log('Starting Main Data call:', DataURI);
    const options_data = {
      host: 'api.rarediseases.info.nih.gov',
      path: DataURI,
      method: 'GET',
      timeout: 5000,
      headers: {
        'APIKey': LegacyKey
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
      let MainDiseaseRecords = json;

      // to clean up data and add the Encoded name to the disease.json record
      MainDiseaseRecords.forEach((record, key, arr) => {
        if (record === undefined) {
          console.error('Record doesnt contain .Name', record);
        } else {
          arr[key] = {...record, ...{EncodedName: Encode(record.diseaseName)}};
        }
      });

      // remove some data, handy for testing
      if (!FetchAllData) {
        MainDiseaseRecords = MainDiseaseRecords.slice(0, 50);
      }

      // Save main file
      const TextDataForDiseasesJson = JSON.stringify({
        'totalSize': MainDiseaseRecords.length,
        'records': MainDiseaseRecords
      });

      // diseases.legacy.json Code
      const KeyNameMain = 'diseases.legacy.json';
      UploadToS3(KeyNameMain, TextDataForDiseasesJson
        , () => {
          console.error(`!!! Error Writing ${KeyNameMain} to S3`);
        }
        , () => {
          console.log(`${KeyNameMain} file has been saved, with`, MainDiseaseRecords.length, 'records!');
        }
      );

      {
        // Save trimmed file for index creation
        const KeyNameTrimmed = 'diseases.legacy.trimmed.json';
        const TextDataForTrimmedDiseasesJson = JSON.stringify({
          'totalSize': MainDiseaseRecords.length,
          'records': MainDiseaseRecords.map(diseaseRecord => {
            return {
              id: diseaseRecord.diseaseId,
              name: diseaseRecord.diseaseName,
              EncodedName: diseaseRecord.EncodedName
            }
          })
        });

        UploadToS3(KeyNameTrimmed, TextDataForTrimmedDiseasesJson
          , () => {
            console.error(`!!! Error Writing ${KeyNameTrimmed} to S3`);
          }
          , () => {
            console.log(`${KeyNameTrimmed} file has been saved, with`, MainDiseaseRecords.length, 'records!');
          }
        );
      }

      {
        // Save Alias file for index creation
        const KeyNameAlias = 'diseases.legacy.alias.json';
        const alias = MainDiseaseRecords.flatMap(diseaseRecord => diseaseRecord.synonyms.map(alias => {
          return {EncodedName: diseaseRecord.EncodedName, EncodedAlias: Encode(alias), alias}
        }));

        const aliasTrimmed = alias.slice(0, 15000);

        const TextDataForAliasDiseasesJson = JSON.stringify({
          'totalSize': aliasTrimmed.length,
          alias: aliasTrimmed
        });

        UploadToS3(KeyNameAlias, TextDataForAliasDiseasesJson
          , () => {
            console.error(`!!! Error Writing ${KeyNameAlias} to S3`);
          }
          , () => {
            console.log(`${KeyNameAlias} file has been saved, with`, alias.length, 'records!');
          }
        );
      }

      // after all processing on diseases.json is done...
      // Make secondary calls for each disease
      const DiseaseDetailDirectory = 'singles';
      if (!fs.existsSync(DiseaseDetailDirectory)) {
        fs.mkdirSync(DiseaseDetailDirectory);
      }

      async.mapLimit(MainDiseaseRecords, FetchThreads, async record => {
        if (record === undefined) {
          console.error('Record doesnt contain .Name', record);
        } else {
          await FetchDataForSecondaryAsync(`/api/diseases/${record.diseaseId}`)
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
                FetchDataForSecondaryAsync(e.DataURI);
              } else if (e.ErrorReason && e.ErrorReason === 'S3') {
                console.error('!!! S3 Error in callback_data_single:response.on.end');
                console.error(e);
                console.error('!!!');
              } else {
                console.error(e);
              }

            });
        }
      }, (err, results) => {
        if (err) {
          console.error('Running Secondary Fetch, error:', err);
        } else {
          console.log('Secondary Fetch Complete', results.length, 'records');
          WriteLocalLog(results.length);
        }
      });

    });
  }

  // SecondaryCallsForDiseaseDetail = async (SecondaryUrl) => {
  //   const response = await wait(100);
  //   FetchDataForSecondary(SecondaryUrl);
  // }

  async function FetchDataForSecondaryAsync(DataURI) {
    return new Promise((resolve, reject) => {

      const options_data = {
        host: 'api.rarediseases.info.nih.gov',
        path: DataURI,
        method: 'GET',
        timeout: 5000,
        headers: {
          'APIKey': LegacyKey
        }
      };

      const req_data = https.request(options_data, callback_data_single.bind(null, resolve, reject));
      req_data.on('error', (error) => {
        reject({...error, ...{DataURI, ErrorReason: 'Network'}});
      });

      req_data.end();
    });
  }

  callback_data_single = (resolve, reject, response) => {
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
          const DiseaseName = Encode(json.mainPropery.diseaseName);
          json = {...json, ...{EncodedName: DiseaseName}};
          const updatedSourceString = JSON.stringify(json);
          const KeyName = `singles/${json.mainPropery.diseaseId}.json`;
          UploadToS3(KeyName, updatedSourceString
            , () => {
              console.error('!!! Error Writing to S3', KeyName);
            }
            , () => {
              // console.log('Success for', KeyName);
            }
          );
        } catch (e) {
          reject({...e, ...{ErrorReason: 'S3'}});
        }
      }
      resolve();
    });

  }

// start Fetch
  FetchDataForMainQuery('/api/diseases');


} else {

  let JWT = null;
  const InitialMainDataQueryURI = encodeURI('/services/data/v49.0/query/?q=select Name, Disease_Name_Full__c, LastModifiedDate,DiseaseID__c,Synonyms_List__c,Disease_Type__c,Curation_List__c,Curation_Notes__c,Curation_Status__c,Disease_Categories__c,Gene_Reviews__c,Published_to_Website__c,Gard_External_ID__c from GARD_Disease__c');
  let MainDiseaseRecords = [];

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

  SecondaryCallsForDiseaseDetail = async (SecondaryUrl) => {
    const response = await wait(100);
    FetchDataForSecondary(SecondaryUrl);
  }

  FetchDataForSecondary = (DataURI) => {
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

  callback_data_single = (response) => {
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
