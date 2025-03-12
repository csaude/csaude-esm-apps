/**
 * This is the entrypoint file of the application. It communicates the
 * important features of this microfrontend to the app shell. It
 * connects the app shell to the React application(s) that make up this
 * microfrontend.
 */
import { getAsyncLifecycle, defineConfigSchema, getSyncLifecycle } from '@openmrs/esm-framework';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';
import { configSchema } from './config-schema';
import { viralLoadDashboardMeta, cd4DashboardMeta, genexpertDashboardMeta, tbLamDashboardMeta } from './dashboard.meta';

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

export const LabResultsSummaryWrapper = getAsyncLifecycle(
  () => import('./lab-results/lab-results-summary-wrapper.component'),
  options,
);

export const LabResults = getAsyncLifecycle(() => import('./lab-results/lab-results.component'), options);

export const viralLoadDashboardLink = getSyncLifecycle(
  createDashboardLink({
    ...viralLoadDashboardMeta,
    moduleName,
  }),
  options,
);

export const cd4AbsoluteDashboardLink = getSyncLifecycle(
  createDashboardLink({
    ...cd4DashboardMeta,
    moduleName,
  }),
  options,
);

export const genexpertDashboardLink = getSyncLifecycle(
  createDashboardLink({
    ...genexpertDashboardMeta,
    moduleName,
  }),
  options,
);

export const TbLamDashboardLink = getSyncLifecycle(
  createDashboardLink({
    ...tbLamDashboardMeta,
    moduleName,
  }),
  options,
);
