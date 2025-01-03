import React from 'react';
import { SubmitHandler } from 'react-hook-form';
import StepForm from '../form/step-form.component';
import Obs from '../form/obs.component';
import { RastreioTb, StepFormComponent } from '../types';

const RastreioTbStep: StepFormComponent<RastreioTb> = ({ values, setValues }) => {
  // Sintomas de Tuberculose (23758) Drop down list
  // Observação TB (1766) Check List
  const onSubmit: SubmitHandler<RastreioTb> = (data) => setValues(data);
  return (
    <>
      <h4>Rastreio TB</h4>
      <StepForm values={values} onSubmit={onSubmit}>
        <Obs name="tbObservations" conceptUuid="2eab4e55-d0d0-4fa8-8d23-b40eaaee44c8" rendering="select" />
      </StepForm>
    </>
  );
};

export default RastreioTbStep;
