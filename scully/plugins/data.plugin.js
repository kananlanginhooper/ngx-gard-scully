"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const scully_1 = require("@scullyio/scully");
// @ts-ignore
const ListOfDiseases = __importStar(require("../../src/assets/diseases.legacy.json"));
// @ts-ignore
const ListOfDiseaseAlias = __importStar(require("../../src/assets/diseases.legacy.alias.json"));
const diseaseIdPlugin = async (route, options) => {
    const arrHandledRoutes = Array();
    ListOfDiseases.records.forEach(record => {
        arrHandledRoutes.push({ route: `/diseases/${record.EncodedName}` });
        arrHandledRoutes.push({ route: `/diseases/${record.EncodedName}/OtherNames` });
    });
    ListOfDiseaseAlias.alias.forEach(record => {
        arrHandledRoutes.push({ route: `/diseases/${record.EncodedName}/OtherNames/${record.EncodedAlias}` });
    });
    return arrHandledRoutes;
};
const validator = async (conf) => [];
scully_1.registerPlugin('router', 'diseaseIds', diseaseIdPlugin, validator);
const diseaseAliasPlugin = async (route, options) => {
    const arrHandledRoutes = Array();
    ListOfDiseaseAlias.alias.forEach(record => {
        arrHandledRoutes.push({ route: `/diseases/${record.EncodedName}/OtherNames/${record.EncodedAlias}` });
    });
    return arrHandledRoutes;
};
scully_1.registerPlugin('router', 'diseaseAlias', diseaseAliasPlugin);
//# sourceMappingURL=data.plugin.js.map