/**
 * This is the entrypoint file of the application. It communicates the
 * important features of this microfrontend to the app shell. It
 * connects the app shell to the React application(s) that make up this
 * microfrontend.
 */
import { defineConfigSchema, getAsyncLifecycle, getSyncLifecycle } from '@openmrs/esm-framework';
import { createDashboardLink } from '@openmrs/esm-patient-common-lib';
import { configSchema } from './config-schema';

const moduleName = '@csaude/esm-ficha-resumo';

const options = {
  featureName: 'ficha-resumo',
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

export const fichaResumo = getAsyncLifecycle(() => import('./ficha-resumo/ficha-resumo.component'), options);

export const fichaResumoDashboardLink = getSyncLifecycle(
  createDashboardLink({
    path: 'ficha-resumo',
    title: 'Ficha Resumo',
    moduleName,
  }),
  options,
);

export const fichaResumoWorkspace = getAsyncLifecycle(() => import('./ficha-resumo/ficha-resumo.workspace'), options);
