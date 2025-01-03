import React from 'react';
import { SubmitHandler } from 'react-hook-form';
import StepForm from '../form/step-form.component';
import Obs from '../form/obs.component';
import { RastreioIts, StepFormComponent } from '../types';

const RastreioItsStep: StepFormComponent<RastreioIts> = ({ values, setValues }) => {
  // Infeção de Transmissão Sexual (174) Drop down list
  const onSubmit: SubmitHandler<RastreioIts> = (data) => setValues(data);
  return (
    <>
      <h4>Rastreio, diagnostico e TT ITS</h4>
      <StepForm values={values} onSubmit={onSubmit}>
        <Obs name="sti" conceptUuid="e1cfe1e0-1d5f-11e0-b929-000c29ad1d07" rendering="select" />
      </StepForm>
    </>
  );
};

export default RastreioItsStep;
