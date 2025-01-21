import React from 'react';
import { SubmitHandler } from 'react-hook-form';
import StepForm from '../form/step-form.component';
import Obs from '../form/obs.component';
import { Pregnancy, StepFormComponent } from '../types';

const YES_CONCEPT_UUID = '1065AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

const PregnancyStep: StepFormComponent<Pregnancy> = ({ values, setValues }) => {
  // Gestante (1982) Drop down
  // Data de Ultima Menstruação (1465) Date Input
  // Lactante (6332) Drop down
  // Método de Planeamento Familiar (374) Check box
  // Outro (23728) Text Input
  const onSubmit: SubmitHandler<Pregnancy> = (data) => setValues(data);
  const hideLastMenstruationDate = (values: Pregnancy) => !values.pregnancy || values.pregnancy !== YES_CONCEPT_UUID;
  const hideBirthControl = (values: Pregnancy) => !values.pregnancy || values.pregnancy === YES_CONCEPT_UUID;
  return (
    <>
      <h4>Gravidez/Lactação/Planeamento familiar</h4>
      <StepForm values={values} onSubmit={onSubmit}>
        <Obs name="pregnancy" conceptUuid="e1e056a6-1d5f-11e0-b929-000c29ad1d07" rendering="select" />
        <Obs name="lactating" conceptUuid="bc4fe755-fc8f-49b8-9956-baf2477e8313" rendering="select" />
        <Obs
          name="lastMenstruationDate"
          conceptUuid="e1dc0dd0-1d5f-11e0-b929-000c29ad1d07"
          rendering="date"
          hide={hideLastMenstruationDate}
        />
        <Obs
          name="birthControl"
          conceptUuid="e1d1a6d8-1d5f-11e0-b929-000c29ad1d07"
          rendering="checkbox"
          hide={hideBirthControl}
        />
        <Obs
          name="otherBirthControl"
          conceptUuid="20ba316b-ef66-4f39-a1af-1e978aa02d18"
          rendering="text"
          hide={hideBirthControl}
        />
      </StepForm>
    </>
  );
};

export default PregnancyStep;
