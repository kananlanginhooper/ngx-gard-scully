import { HandledRoute, registerPlugin } from "@scullyio/scully";
import { ListOfDiseases } from '../../src/app/diseases';
import { of } from 'rxjs';

async function diseaseIdPlugin(route: string, config = {}): Promise<HandledRoute[]> {
    const obs = of(ListOfDiseases); // mock observable
    const ids = await obs.toPromise();
    return ids.map(id => ({ route: `/diseases/${id}` }));
}

const validator = async (conf) => [];
registerPlugin('router', 'diseaseIds', diseaseIdPlugin, validator);