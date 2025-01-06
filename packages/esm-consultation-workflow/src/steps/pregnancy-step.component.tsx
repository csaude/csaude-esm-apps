import React from 'react';
import { SubmitHandler } from 'react-hook-form';
import StepForm from '../form/step-form.component';
import Obs from '../form/obs.component';
import { Pregnancy, StepFormComponent } from '../types';

const PregnancyStep: StepFormComponent<Pregnancy> = ({ values, setValues }) => {
  // Data de Ultima Menstruação (1465) Date Input
  // Lactante (6332) Drop down
  // Método de Planeamento Familiar (374) Check box
  // Outro (23728) Text Input
  const onSubmit: SubmitHandler<Pregnancy> = (data) => setValues(data);
  return (
    <>
      <h4>Gravidez/Lactação/Planeamento familiar</h4>
      <StepForm values={values} onSubmit={onSubmit}>
        <Obs name="lastMenstruationDate" conceptUuid="e1dc0dd0-1d5f-11e0-b929-000c29ad1d07" rendering="date" />
        <Obs name="lactating" conceptUuid="bc4fe755-fc8f-49b8-9956-baf2477e8313" rendering="select" />
        <Obs name="birthControl" conceptUuid="e1d1a6d8-1d5f-11e0-b929-000c29ad1d07" rendering="checkbox" />
        <Obs name="otherBirthControl" conceptUuid="20ba316b-ef66-4f39-a1af-1e978aa02d18" rendering="text" />
      </StepForm>
    </>
  );
};

export default PregnancyStep;
