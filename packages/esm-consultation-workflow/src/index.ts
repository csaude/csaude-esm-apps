/**
 * This is the entrypoint file of the application. It communicates the
 * important features of this microfrontend to the app shell. It
 * connects the app shell to the React application(s) that make up this
 * microfrontend.
 */
import { defineConfigSchema, getAsyncLifecycle, registerFeatureFlag } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';

const moduleName = '@openmrs/esm-consultation-workflow';

const options = {
  featureName: 'root-world',
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
  registerFeatureFlag(
    'consultation-workflow',
    'Consultation workflow',
    'Whether to enable the consultation workflow feature',
  );
}

export const consultationWorkflowActionButton = getAsyncLifecycle(
  () => import('./consultation-workflow-action-button.component'),
  options,
);

export const consultationWorkflowWorkspace = getAsyncLifecycle(
  () => import('./consultation-workflow.workspace'),
  options,
);
