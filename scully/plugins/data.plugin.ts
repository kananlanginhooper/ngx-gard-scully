import {HandledRoute, registerPlugin} from '@scullyio/scully';

// @ts-ignore
import * as ListOfDiseases from '../../src/assets/diseases.legacy.json';

// @ts-ignore
import * as ListOfDiseaseAlias from '../../src/assets/diseases.legacy.alias.json';

const diseaseIdPlugin = async (route: string, options): Promise<HandledRoute[]> => {
  const arrHandledRoutes = Array<HandledRoute>();
  ListOfDiseases.records.forEach(record => {
    arrHandledRoutes.push({route: `/diseases/${record.EncodedName}`});
    arrHandledRoutes.push({route: `/diseases/${record.EncodedName}/OtherNames`});
  });
  // ListOfDiseaseAlias.alias.forEach(record => {
  //   arrHandledRoutes.push({route: `/diseases/${record.EncodedName}/OtherNames/${record.EncodedAlias}`});
  // });
  return arrHandledRoutes;
};

const validator = async (conf) => [];
registerPlugin('router', 'diseaseIds', diseaseIdPlugin, validator);


const diseaseAliasPlugin = async (route: string, options): Promise<HandledRoute[]> => {
  const arrHandledRoutes = Array<HandledRoute>();
  ListOfDiseaseAlias.alias.forEach(record => {
    arrHandledRoutes.push({route: `/diseases/${record.EncodedName}/OtherNames/${record.EncodedAlias}`});
  });
  return arrHandledRoutes;
};

registerPlugin('router', 'diseaseAlias', diseaseAliasPlugin);
