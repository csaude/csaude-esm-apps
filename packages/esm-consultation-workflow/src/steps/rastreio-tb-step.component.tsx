import React from 'react';
import { SubmitHandler } from 'react-hook-form';
import StepForm from '../form/step-form.component';
import Obs from '../form/obs.component';
import { RastreioTb, StepFormComponent } from '../types';

const NO_CONCEPT_UUID = '1066AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

const RastreioTbStep: StepFormComponent<RastreioTb> = ({ values, setValues }) => {
  // Sintomas de Tuberculose (23758) Drop down list
  // Observação TB (1766) Check List
  const onSubmit: SubmitHandler<RastreioTb> = (data) => setValues(data);
  const hide = (values: RastreioTb) => !values.tbObservations || values.tbObservations === NO_CONCEPT_UUID;
  return (
    <>
      <h4>Rastreio TB</h4>
      <StepForm values={values} onSubmit={onSubmit}>
        <Obs name="tbObservations" conceptUuid="2eab4e55-d0d0-4fa8-8d23-b40eaaee44c8" rendering="select" />
        <Obs name="tbSymptoms" conceptUuid="e1de6d1e-1d5f-11e0-b929-000c29ad1d07" rendering="checkbox" hide={hide} />
      </StepForm>
    </>
  );
};

export default RastreioTbStep;
