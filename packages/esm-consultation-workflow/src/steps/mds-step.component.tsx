import React from 'react';
import { SubmitHandler } from 'react-hook-form';
import StepForm from '../form/step-form.component';
import Obs from '../form/obs.component';
import { Mds, StepFormComponent } from '../types';

const MdsStep: StepFormComponent<Mds> = ({ values, setValues }) => {
  // Elegível Modelo Diferenciado de Cuidado (23765) Drop down list
  // Modelo Diferenciado de Cuidado (165174) Drop down list
  // Estado do MDC (165322) Drop down list
  // Outro modelo (23732) Text Input
  const onSubmit: SubmitHandler<Mds> = (data) => setValues(data);
  return (
    <>
      <h4>MDS</h4>
      <StepForm values={values} onSubmit={onSubmit}>
        <Obs name="eligible" conceptUuid="01533658-e014-493b-9d52-4f49f50ec68b" rendering="select" />
        <Obs name="mds" conceptUuid="40a9a12b-1205-4a55-bb93-caf15452bf61" rendering="select" />
        <Obs name="mdsStage" conceptUuid="fef178f2-d4c9-4035-9989-11c9afe81ea3" rendering="select" />
        <Obs name="otherModel" conceptUuid="815b9762-329d-42c8-9158-d42016c49b85" rendering="text" />
      </StepForm>
    </>
  );
};

export default MdsStep;
