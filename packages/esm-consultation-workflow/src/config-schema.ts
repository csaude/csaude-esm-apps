import { Type } from '@openmrs/esm-framework';

/**
 * This is the config schema. It expects a configuration object which
 * looks like this:
 *
 * ```json
 * { "casualGreeting": true, "whoToGreet": ["Mom"] }
 * ```
 *
 * In OpenMRS Microfrontends, all config parameters are optional. Thus,
 * all elements must have a reasonable default. A good default is one
 * that works well with the reference application.
 *
 * To understand the schema below, please read the configuration system
 * documentation:
 *   https://openmrs.github.io/openmrs-esm-core/#/main/config
 * Note especially the section "How do I make my module configurable?"
 *   https://openmrs.github.io/openmrs-esm-core/#/main/config?id=im-developing-an-esm-module-how-do-i-make-it-configurable
 * and the Schema Reference
 *   https://openmrs.github.io/openmrs-esm-core/#/main/config?id=schema-reference
 */
export const configSchema = {
  visitNoteConfig: {
    encounterNoteTextConceptUuid: {
      _type: Type.ConceptUuid,
      _default: '162169AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
    visitDiagnosesConceptUuid: {
      _type: Type.ConceptUuid,
      _default: '159947AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    },
    encounterTypeUuid: {
      _type: Type.UUID,
      _default: 'd7151f82-c1f3-4152-a605-2f9ea7414a79',
    },
  },
};

export type Config = {
  visitNoteConfig: {
    encounterNoteTextConceptUuid: string;
    visitDiagnosesConceptUuid: string;
    encounterTypeUuid: string;
  };
};
