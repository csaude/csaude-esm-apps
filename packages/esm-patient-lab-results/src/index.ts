/**
 * This is the entrypoint file of the application. It communicates the
 * important features of this microfrontend to the app shell. It
 * connects the app shell to the React application(s) that make up this
 * microfrontend.
 */
import { getAsyncLifecycle, defineConfigSchema, getSyncLifecycle } from '@openmrs/esm-framework';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';
import { configSchema } from './config-schema';

const moduleName = '@csaude/esm-patient-lab-results';

const options = {
  featureName: 'patient-lab-results',
  moduleName,
};

/**
 * This tells the app shell how to obtain translation files: that they
 * are JSON files in the directory `../translations` (which you should
 * see in the directory structure).
 */
export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

/**
 * This function performs any setup that should happen at microfrontend
 * load-time (such as defining the config schema) and then returns an
 * object which describes how the React application(s) should be
 * rendered.
 */
export function startupApp() {
  defineConfigSchema(moduleName, configSchema);
}

export const ViralLoadWidget = getAsyncLifecycle(() => import('./lab-results/viral-load.component'), options);
export const Cd4AbsoluteWidget = getAsyncLifecycle(() => import('./lab-results/cd4-absolute.component'), options);
export const GenexpertWidget = getAsyncLifecycle(() => import('./lab-results/genexpert.component'), options);
export const TbLamWidget = getAsyncLifecycle(() => import('./lab-results/tb-lan.component'), options);

export const viralLoadDashboardLink = getSyncLifecycle(
  createDashboardLink({
    path: 'viral-load',
    title: 'Viral Load',
    moduleName,
  }),
  options,
);

export const cd4AbsoluteDashboardLink = getSyncLifecycle(
  createDashboardLink({
    path: 'cd4-absolute',
    title: 'CD4 Absolute',
    moduleName,
  }),
  options,
);

export const genexpertDashboardLink = getSyncLifecycle(
  createDashboardLink({
    path: 'genexpert',
    title: 'Genexpert',
    moduleName,
  }),
  options,
);

export const TbLamDashboardLink = getSyncLifecycle(
  createDashboardLink({
    path: 'tb-lam',
    title: 'TB Lam',
    moduleName,
  }),
  options,
);
