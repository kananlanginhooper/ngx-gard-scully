import {HandledRoute, registerPlugin} from '@scullyio/scully';

// @ts-ignore
import * as ListOfDiseases from '../../src/assets/diseases.legacy.json';

// @ts-ignore
import * as ListOfDiseaseAlias from '../../src/assets/diseases.legacy.alias.json';

const diseaseIdPlugin = async (route: string, options): Promise<HandledRoute[]> => {
    const arrHandledRoutes = Array<HandledRoute>();
    ListOfDiseases.records.forEach(record => {
      arrHandledRoutes.push({route: `/diseases/${record.EncodedName}`});
    });

    for (let i = arrHandledRoutes.length; i <= +process.env.PageCount; i++) {
      arrHandledRoutes.push({route: `/filler/${i}`});
    }

    return arrHandledRoutes;
  };


const validator = async (conf) => [];
registerPlugin('router', 'diseaseIds', diseaseIdPlugin, validator);
