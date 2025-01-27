import React, { useState } from 'react';
import { Wizard } from 'react-use-wizard';
import {
  AppointmentStep,
  AvaliacaoDeAdesaoStep,
  AvaliacaoNutricionalStep,
  MdsStep,
  ConditionsStep,
  OrdersStep,
  PregnancyStep,
  ProfilaxiaStep,
  RastreioItsStep,
  RastreioTbStep,
  ReferenciasStep,
  VisitNotesStep,
} from './steps';

import { showSnackbar } from '@openmrs/esm-framework';
import { DefaultPatientWorkspaceProps } from '@openmrs/esm-patient-common-lib';
import { useTranslation } from 'react-i18next';
import styles from './consultation-workflow.scss';
import Footer from './footer.component';
import {
  Mds,
  Pregnancy,
  Profilaxia,
  RastreioIts,
  RastreioTb,
  Referencias,
  type AvaliacaoDeAdesao,
  type AvaliacaoNutricional,
} from './types';

const Wrapper = ({ children }: { children?: any }) => <div className={styles.wrapper}>{children}</div>;

const ConsultationWorkflowWorkspace: React.FC<DefaultPatientWorkspaceProps> = ({
  patientUuid,
  closeWorkspace,
  closeWorkspaceWithSavedChanges,
}) => {
  const { t } = useTranslation();
  const [avaliacaoDeAdesao, setAvaliacaoDeAdesao] = useState<AvaliacaoDeAdesao>({
    adherence: '',
    arvSideEffects: [],
    ctzSideEffect: '',
    inhSideEffect: '',
  });
  const [avaliacaoNutricional, setAvaliacaoNutricional] = useState<AvaliacaoNutricional>({
    classificationOfMalnutrition: null,
    indicator: null,
  });
  const [rastreioIts, setRastreioIts] = useState<RastreioIts>({
    stiScreening: null,
    sti: '',
  });
  const [pregnancy, setPregnancy] = useState<Pregnancy>({
    pregnancy: '',
    birthControl: [],
    lactating: '',
    lastMenstruationDate: null,
    otherBirthControl: '',
  });
  const [rastreioTb, setRastreioTb] = useState<RastreioTb>({
    tbObservations: [],
    tbSymptoms: '',
  });
  const [profilaxia, setProfilaxia] = useState<Profilaxia>({
    dispensationMode: '',
    nextPickupDate: null,
    regimen: '',
    treatmentStatus: '',
  });
  const [mds, setMds] = useState<Mds>({
    eligible: '',
    mds: '',
    mdsStage: '',
    otherModel: '',
  });
  const [referencias, setReferencias] = useState<Referencias>({
    referralsOrdered: '',
    otherReferral: '',
    eligibleSupportGroup: '',
    reveletedChildren: '',
    fathersAndCaregivers: '',
    reveletedAdolescents: '',
    motherToMother: '',
    mentoringMother: '',
    youthAndTeenageMenthor: '',
    championMan: '',
    otherSupportGroup: '',
  });

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const save = async () => {
    await sleep(1000);
    closeWorkspaceWithSavedChanges();
    showSnackbar({
      isLowContrast: true,
      kind: 'success',
      title: 'TODO',
      subtitle: t('consultationSaved', 'Clinical consultation saved successfully'),
    });
  };

  const footer = <Footer onSave={save} onCancel={closeWorkspace} />;
  return (
    <div className={styles.container}>
      <Wizard footer={footer} wrapper={<Wrapper />}>
        <VisitNotesStep patientUuid={patientUuid} />
        <AvaliacaoDeAdesaoStep values={avaliacaoDeAdesao} setValues={setAvaliacaoDeAdesao} />
        <AvaliacaoNutricionalStep values={avaliacaoNutricional} setValues={setAvaliacaoNutricional} />
        <RastreioItsStep values={rastreioIts} setValues={setRastreioIts} />
        <PregnancyStep values={pregnancy} setValues={setPregnancy} />
        <RastreioTbStep values={rastreioTb} setValues={setRastreioTb} />
        <ProfilaxiaStep values={profilaxia} setValues={setProfilaxia} />
        <ConditionsStep patientUuid={patientUuid} />
        <MdsStep values={mds} setValues={setMds} />
        <OrdersStep patientUuid={patientUuid} />
        <ReferenciasStep values={referencias} setValues={setReferencias} />
        <AppointmentStep patientUuid={patientUuid} />
      </Wizard>
    </div>
  );
};

export default ConsultationWorkflowWorkspace;
