const https = require('https');
const util = require('./util');
const fs = require("fs");
const async = require("async");

FetchDataForMainQuery = (DataURI) => {
  console.log('Starting Main Data call:', DataURI);
  const options_data = {
    host: 'api.rarediseases.info.nih.gov',
    path: DataURI,
    method: 'GET',
    timeout: 5000,
    headers: {
      'APIKey': util.LegacyKey
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
        arr[key] = {...record, ...{EncodedName: util.Encode(record.diseaseName)}};
      }
    });

    // remove some data, handy for testing
    if (!util.FetchAllData) {
      MainDiseaseRecords = MainDiseaseRecords.slice(0, 50);
    }

    // Save main file
    const TextDataForDiseasesJson = JSON.stringify({
      'totalSize': MainDiseaseRecords.length,
      'records': MainDiseaseRecords
    });

    // diseases.legacy.json Code
    const KeyNameMain = 'diseases.legacy.json';
    util.UploadToS3(KeyNameMain, TextDataForDiseasesJson
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

      util.UploadToS3(KeyNameTrimmed, TextDataForTrimmedDiseasesJson
        , () => {
          console.error(`!!! Error Writing ${KeyNameTrimmed} to S3`);
        }
        , () => {
          console.log(`${KeyNameTrimmed} file has been saved, with`, MainDiseaseRecords.length, 'records!');
        }
      );
    }

    // {
    //   // Save Alias file for index creation
    //   const KeyNameAlias = 'diseases.legacy.alias.json';
    //   const alias = MainDiseaseRecords.flatMap(diseaseRecord => diseaseRecord.synonyms.map(alias => {
    //     return {EncodedName: diseaseRecord.EncodedName, EncodedAlias: Encode(alias), alias}
    //   }));
    //
    //   const aliasTrimmed = alias.slice(0, 15000);
    //
    //   const TextDataForAliasDiseasesJson = JSON.stringify({
    //     'totalSize': aliasTrimmed.length,
    //     alias: aliasTrimmed
    //   });
    //
    //   util.UploadToS3(KeyNameAlias, TextDataForAliasDiseasesJson
    //     , () => {
    //       console.error(`!!! Error Writing ${KeyNameAlias} to S3`);
    //     }
    //     , () => {
    //       console.log(`${KeyNameAlias} file has been saved, with`, alias.length, 'records!');
    //     }
    //   );
    // }

    // after all processing on diseases.json is done...
    // Make secondary calls for each disease
    const DiseaseDetailDirectory = 'singles';
    if (!fs.existsSync(DiseaseDetailDirectory)) {
      fs.mkdirSync(DiseaseDetailDirectory);
    }

    async.mapLimit(MainDiseaseRecords, util.FetchThreads, async record => {
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
        util.WriteLocalLog(results.length);
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
        'APIKey': util.LegacyKey
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
        const DiseaseName = util.Encode(json.mainPropery.diseaseName);
        json = {...json, ...{EncodedName: DiseaseName}};
        const updatedSourceString = JSON.stringify(json);
        const KeyName = `singles/${json.mainPropery.diseaseId}.json`;
        util.UploadToS3(KeyName, updatedSourceString
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

RunFetch = () => {
// start Fetch
  FetchDataForMainQuery('/api/diseases');
}

module.exports ={
  RunFetch
}
