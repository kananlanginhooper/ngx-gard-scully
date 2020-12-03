import { ScullyConfig } from '@scullyio/scully';
import './scully/plugins/data.plugin';

export const config: ScullyConfig = {
    projectRoot: "./src",
    projectName: "ngx-gard-skully",
    outDir: './dist/static',
    routes: {
        '/diseases/:id': {
            type: 'diseaseIds',
        },
    }
};