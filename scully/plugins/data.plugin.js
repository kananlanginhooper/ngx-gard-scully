"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const scully_1 = require("@scullyio/scully");
const diseases_1 = require("../../src/app/diseases");
const rxjs_1 = require("rxjs");
async function diseaseIdPlugin(route, config = {}) {
    const obs = rxjs_1.of(diseases_1.ListOfDiseases); // mock observable
    const ids = await obs.toPromise();
    return ids.map(id => ({ route: `/diseases/${id}` }));
}
const validator = async (conf) => [];
scully_1.registerPlugin('router', 'diseaseIds', diseaseIdPlugin, validator);
//# sourceMappingURL=data.plugin.js.map