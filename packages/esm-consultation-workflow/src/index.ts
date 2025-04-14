/**
 * This is the entrypoint file of the application. It communicates the
 * important features of this microfrontend to the app shell. It
 * connects the app shell to the React application(s) that make up this
 * microfrontend.
 */
import { defineConfigSchema, getAsyncLifecycle, getSyncLifecycle, registerFeatureFlag } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import { registerCustomDataSource, registerPostSubmissionAction } from '@csaude/esm-form-engine-lib';
import { dashboardMeta } from './dashboard.meta';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib/src';

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
  registerPostSubmissionAction({
    name: 'DrugOrderSubmissionAction',
    load: () => import('./form-engine-extensions/post-submission-handlers/drug-order-submission-action'),
  });

  registerCustomDataSource({
    name: 'DrugFormulationDatasource',
    load: () => import('./form-engine-extensions/datasources/drug-formulation-datasource'),
  });
}

export const consultationWorkflowActionButton = getAsyncLifecycle(
  () => import('./consultation-workflow-action-button.component'),
  options,
);

export const dynamicWorkflowWorkspace = getAsyncLifecycle(
  () => import('./dynamic-workflow/dynamic-workflow.workspace'),
  options,
);

// Jerson's exports ///////////////////////////////////////////
// ///////////////// Jerson's exports ///////////////////////////////////////////
// ///////////////////////////////////Jerson's exports ///////////////////////////////////////////
export const consultationWorkflowsWorkspace = getAsyncLifecycle(
  () => import('./consultation-workflows/consultation-workflows-dashboard.workspace'),
  options,
);

export const consultationWorkflowsVisualizer = getAsyncLifecycle(
  () => import('./workflow-visualizer/consultation-workflow-visualizer.component'),
  options,
);

export const consultationWorkflowVisualizerDashboardLink = getSyncLifecycle(
  createDashboardLink({
    ...dashboardMeta,
    moduleName,
  }),
  options,
);
