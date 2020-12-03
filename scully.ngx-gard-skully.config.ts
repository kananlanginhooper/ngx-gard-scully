import { ScullyConfig, setPluginConfig } from '@scullyio/scully';
import './scully/plugins/data.plugin';
import { DisableAngular } from 'scully-plugin-disable-angular';

setPluginConfig(DisableAngular, {
    removeState: true
});

export const config: ScullyConfig = {
    projectRoot: "./src",
    projectName: "ngx-gard-skully",
    outDir: './dist/static',
    defaultPostRenderers: [DisableAngular],
    routes: {
        '/diseases/:id': {
            type: 'diseaseIds',
        }
    },
};