import {HandledRoute, registerPlugin} from "@scullyio/scully";
// import { ListOfDiseases } from '../../src/app/diseases';
// import { of } from 'rxjs';

// @ts-ignore
import * as ListOfDiseases from '../../src/assets/diseases.legacy.json';

// async function diseaseIdPlugin(route: string, config = {}): Promise<HandledRoute[]> {
//     const obs = of(ListOfDiseases); // mock observable
//     const ids = await obs.toPromise();
//     return ids.map(id => ({ route: `/diseases/${id}` }));
// }

const diseaseIdPlugin = async (route: string, options): Promise<HandledRoute[]> => {
  const arrHandledRoutes = Array<HandledRoute>();
  ListOfDiseases.records.forEach(record => {
    arrHandledRoutes.push({route: `/diseases/${record.diseaseId}`});
  });
  return arrHandledRoutes;
};

const validator = async (conf) => [];
registerPlugin('router', 'diseaseIds', diseaseIdPlugin, validator);

