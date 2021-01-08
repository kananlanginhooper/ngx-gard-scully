import {RouteTypes, ScullyConfig, setPluginConfig} from '@scullyio/scully';
import './scully/plugins/data.plugin';
import {DisableAngular} from 'scully-plugin-disable-angular';
import {getFlashPreventionPlugin} from 'scully-plugin-flash-prevention';

const postRenderers = [DisableAngular];

export const config: ScullyConfig = {
  projectRoot: './src',
  projectName: 'ngx-gard-skully',
  outDir: './dist/static',
  routes: {
    '/diseases/:id': {
      type: 'diseaseIds',
    },
    '/diseases/:id/OtherNames/:alias': {
      type: 'diseaseAlias',
    },
  },
  defaultPostRenderers: [getFlashPreventionPlugin()],
};
