/**
 * This is the entrypoint file of the application. It communicates the
 * important features of this microfrontend to the app shell. It
 * connects the app shell to the React application(s) that make up this
 * microfrontend.
 */
import { getAsyncLifecycle, defineConfigSchema } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';

const moduleName = '@csaude/esm-wizard-workflow-builder';

const options = {
  featureName: 'wizard workflow builder',
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

/**
 * This named export tells the app shell that the default export of `root.component.tsx`
 * should be rendered when the route matches `root`. The full route
 * will be `openmrsSpaBase() + 'root'`, which is usually
 * `/openmrs/spa/root`.
 */
export const root = getAsyncLifecycle(() => import('./root.component'), options);

export const systemAdministrationWizardWorkflowBuilderCardLink = getAsyncLifecycle(
  () => import('./wizard-workflow-builder-admin-card-link.component'),
  options,
);

export const newWorkflowModal = getAsyncLifecycle(
  () => import('./components/interactive-builder/modals/new-workflow/new-workflow.modal'),
  options,
);

export const StepModal = getAsyncLifecycle(
  () => import('./components/interactive-builder/modals/step/step.modal'),
  options,
);

export const addConditionModal = getAsyncLifecycle(
  () => import('./components/step-condition/add-condition.modal'),
  options,
);

export const deleteStepModal = getAsyncLifecycle(
  () => import('./components/interactive-builder/modals/delete-step/delete-step.modal'),
  options,
);

export const addCriteriaModal = getAsyncLifecycle(
  () => import('./components/eligibility-criteria/modals/add-criteria/add-criteria.modal'),
  options,
);

export const deleteWorkflowModal = getAsyncLifecycle(
  () => import('./components/interactive-builder/modals/delete-workflow/delete-workflow.modal'),
  options,
);

export const unpublishWorkflowModal = getAsyncLifecycle(
  () => import('./components/interactive-builder/modals/unpublish-workflow/unpublish-workflow.modal'),
  options,
);
