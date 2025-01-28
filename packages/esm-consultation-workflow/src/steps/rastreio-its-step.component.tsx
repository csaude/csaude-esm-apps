import React from 'react';
import { SubmitHandler } from 'react-hook-form';
import Obs from '../form/obs.component';
import StepForm from '../form/step-form.component';
import { RastreioIts, StepFormComponent } from '../types';

const NO_CONCEPT_UUID = '1066AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

const RastreioItsStep: StepFormComponent<RastreioIts> = ({ values, setValues }) => {
  const onSubmit: SubmitHandler<RastreioIts> = (data) => setValues(data);
  const hide = (values: RastreioIts) => !values.stiScreening || values.stiScreening === NO_CONCEPT_UUID;
  return (
    <>
      <h4>Rastreio, diagnostico e TT ITS</h4>
      <StepForm values={values} onSubmit={onSubmit}>
        <Obs name="stiScreening" conceptUuid="794ef662-03bc-4e22-90ff-38742b82827a" rendering="select" />
        <Obs name="sti" conceptUuid="e1cfe1e0-1d5f-11e0-b929-000c29ad1d07" rendering="select" hide={hide} />
      </StepForm>
    </>
  );
};

export default RastreioItsStep;
