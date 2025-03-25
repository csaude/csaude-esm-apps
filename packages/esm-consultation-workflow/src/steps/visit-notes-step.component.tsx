import React from 'react';

import { InlineLoading, Tag, Tile } from '@carbon/react';
import { closeWorkspace, useConfig, useVisit } from '@openmrs/esm-framework';
import { EmptyState, ErrorState, launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { useTranslation } from 'react-i18next';
import { useWizard } from 'react-use-wizard';
import { Config } from '../config-schema';
import styles from './../consultation-workflow.scss';

interface VisitNote {
  diagnoses: string[];
  note: string;
}

interface UseVisitNotes {
  isLoading: boolean;
  error: Error;
  visitNotes: VisitNote[];
  mutate: () => void;
}

const visitRepresentation =
  'custom:(uuid,display,voided,indication,startDatetime,stopDatetime,' +
  'encounters:(uuid,display,encounterDatetime,encounterType,obs,diagnoses)';

function useVisitNotes(patientUuid: string): UseVisitNotes {
  interface Diagnoses {
    display: string;
  }

  interface Obs {
    value: string;
    concept: {
      uuid: string;
    };
  }

  const {
    visitNoteConfig: { encounterTypeUuid, encounterNoteTextConceptUuid },
  } = useConfig<Config>();

  const { isLoading, error, activeVisit, mutate } = useVisit(patientUuid, visitRepresentation);

  let visitNotes: VisitNote[] = [];
  if (activeVisit) {
    visitNotes = activeVisit.activeVisit?.encounters
      .filter((e) => e.encounterType.uuid === encounterTypeUuid)
      .map((e) => ({
        diagnoses: e.diagnoses.map((d: Diagnoses) => d.display),
        note: e.obs.find((o: Obs) => o.concept.uuid === encounterNoteTextConceptUuid)?.value,
      }));
  }

  return {
    isLoading,
    error,
    visitNotes,
    mutate,
  };
}

function launchClinicalNotesWorkspace({ onNoteSave }: { onNoteSave: () => void }): void {
  launchPatientWorkspace('visit-notes-form-workspace', {
    closeWorkspaceWithSavedChanges: () => {
      closeWorkspace('visit-notes-form-workspace', { ignoreChanges: true, onWorkspaceClose: onNoteSave });
    },
  });
}

const VisitNotesStep: React.FC<{ patientUuid: string }> = ({ patientUuid }) => {
  const { handleStep } = useWizard();
  const { isLoading, error, visitNotes, mutate } = useVisitNotes(patientUuid);
  const { t } = useTranslation();

  // handleStep(() => {
  //   if (!visitNotes.length) {
  //     throw new Error(t('pleaseCreateVisitNote', 'Please create a visit note'));
  //   }
  // });

  if (isLoading) {
    return <InlineLoading />;
  }

  if (error) {
    return <ErrorState error={error} headerTitle="Erro!" />;
  }

  if (!visitNotes.length) {
    return (
      <EmptyState
        displayText={t('visitNote', 'Nota da visita')}
        headerTitle={t('visitNotes', 'Notas da visita')}
        launchForm={() => launchClinicalNotesWorkspace({ onNoteSave: mutate })}
      />
    );
  }

  return (
    <div className={styles.step}>
      <h4>{t('visitNotes', 'Notas da visita')}</h4>
      {visitNotes.map((vn, i) => (
        <div>
          <span className={styles.diagnosisLabel}>{t('diagnoses', 'Diagnósticos')}</span>
          {vn.diagnoses.map((diagnosis, j) => (
            <Tag key={`vn-${i}-diagnosis-${j}`}>{diagnosis}</Tag>
          ))}
          <Tile>{vn.note}</Tile>
        </div>
      ))}
    </div>
  );
};

export default VisitNotesStep;
