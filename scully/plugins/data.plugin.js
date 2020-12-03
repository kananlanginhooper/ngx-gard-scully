"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const scully_1 = require("@scullyio/scully");
const diseases_1 = require("../../src/app/diseases");
const rxjs_1 = require("rxjs");
async function diseaseIdPlugin(route, config = {}) {
    // mock observable 
    const obs = rxjs_1.of(diseases_1.ListOfDiseases);
    const ids = await obs.toPromise();
    return ids.map(id => ({ route: `/diseases/${id}` }));
    // return Promise.resolve([
    //     { route: '/diseases/1' },
    //     { route: '/diseases/2' },
    //     { route: '/diseases/3' },
    //     { route: '/diseases/4' },
    //     { route: '/diseases/5' },
    // ]);
}
const validator = async (conf) => [];
scully_1.registerPlugin('router', 'diseaseIds', diseaseIdPlugin, validator);
//# sourceMappingURL=data.plugin.js.map