import React from 'react';
import { SubmitHandler } from 'react-hook-form';
import StepForm from '../form/step-form.component';
import Obs from '../form/obs.component';
import { OpportunisticInfections, StepFormComponent } from '../types';

const OpportunisticInfectionsStep: StepFormComponent<OpportunisticInfections> = ({ values, setValues }) => {
  // Outros Diagnósticos (1406) Drop down list
  // Outros Diagnósticos sem código (1649) Text Input
  // Estadio OMS Actual (5356) Drop down list
  const onSubmit: SubmitHandler<OpportunisticInfections> = (data) => setValues(data);
  return (
    <>
      <h4>Infeções oportunistas e estadiamento OMS</h4>
      <StepForm values={values} onSubmit={onSubmit}>
        <Obs name="otherDiagnistics" conceptUuid="e1dae234-1d5f-11e0-b929-000c29ad1d07" rendering="select" />
        <Obs name="otherDiagnosticsNonCoded" conceptUuid="e1dd2d50-1d5f-11e0-b929-000c29ad1d07" rendering="text" />
        <Obs name="currentWhoStage" conceptUuid="e1e53c02-1d5f-11e0-b929-000c29ad1d07" rendering="select" />
      </StepForm>
    </>
  );
};

export default OpportunisticInfectionsStep;
