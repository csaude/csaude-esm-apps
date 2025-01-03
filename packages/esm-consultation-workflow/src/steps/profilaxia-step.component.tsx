import React from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import Obs from '../form/obs.component';
import { Profilaxia, StepFormComponent } from '../types';
import StepForm from '../form/step-form.component';

const ProfilaxiaStep: StepFormComponent<Profilaxia> = ({ values, setValues }) => {
  // Should trigger an automatic receita para a farmacia because it comes from the FILT.\
  // TPT_Regime (23985) Drop Down List
  // Tipo de Dispensa (23986) Drop down List
  // Seguimento de Tratamento (23987) Drop down List
  // Data do Próximo Levantamento (23988) Date Input
  const onSubmit: SubmitHandler<Profilaxia> = (data) => setValues(data);
  return (
    <>
      <h4>Profilaxia</h4>
      <StepForm values={values} onSubmit={onSubmit}>
        <Obs name="regimen" conceptUuid="9db4ce3b-4c1c-45dd-905f-c984a052f26e" rendering="select" />
        <Obs name="dispensationMode" conceptUuid="d5c15047-58f3-4eb2-9f98-af82e3531cb5" rendering="select" />
        <Obs name="treatmentStatus" conceptUuid="93603742-1cae-4970-9077-e2b27e46bd7e" rendering="select" />
        <Obs name="nextPickupDate" conceptUuid="b7c246bc-f2b6-49e5-9325-911cdca7a8b3" rendering="date" />
      </StepForm>
    </>
  );
};

export default ProfilaxiaStep;
