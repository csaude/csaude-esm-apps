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
  VisitNotesStep,
} from './steps';

import { DefaultPatientWorkspaceProps } from '@openmrs/esm-patient-common-lib';
import styles from './consultation-workflow.scss';
import Footer from './footer.component';
import {
  Mds,
  Pregnancy,
  Profilaxia,
  RastreioIts,
  RastreioTb,
  type AvaliacaoDeAdesao,
  type AvaliacaoNutricional,
} from './types';

const Wrapper = ({ children }: { children?: any }) => <div className={styles.wrapper}>{children}</div>;

const ConsultationWorkflowWorkspace: React.FC<DefaultPatientWorkspaceProps> = ({
  patientUuid,
  closeWorkspace,
  closeWorkspaceWithSavedChanges,
}) => {
  const [avaliacaoDeAdesao, setAvaliacaoDeAdesao] = useState<AvaliacaoDeAdesao>({
    adherence: '',
    arvSideEffects: '',
    ctzSideEffect: '',
    inhSideEffect: '',
  });
  const [avaliacaoNutricional, setAvaliacaoNutricional] = useState<AvaliacaoNutricional>({
    bmi: null,
    classificationOfMalnutrition: null,
    height: null,
    indicator: null,
    muac: null,
    weight: null,
  });
  const [rastreioIts, setRastreioIts] = useState<RastreioIts>({
    sti: '',
  });
  const [pregnancy, setPregnancy] = useState<Pregnancy>({
    birthControl: '',
    lactating: '',
    lastMenstruationDate: null,
    otherBirthControl: '',
  });
  const [rastreioTb, setRastreioTb] = useState<RastreioTb>({
    tbObservations: [],
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

  const footer = (
    <Footer closeWorkspaceWithSavedChanges={closeWorkspaceWithSavedChanges} closeWorkspace={closeWorkspace} />
  );
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
        <AppointmentStep patientUuid={patientUuid} />
      </Wizard>
    </div>
  );
};

export default ConsultationWorkflowWorkspace;
