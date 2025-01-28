import React from 'react';
import { Referencias, StepFormComponent } from '../types';
import { SubmitHandler } from 'react-hook-form';
import StepForm from '../form/step-form.component';
import Obs from '../form/obs.component';

const ReferenciasStep: StepFormComponent<Referencias> = ({ values, setValues }) => {
  // Referências (1272) Drop down list
  // Outros Encaminhamentos Para (2040) Text Input
  // Elegível Grupo de Apoio (23764) Drop down list
  // Crianças Reveladas (23753) Drop down list
  // Pais e Cuidadores (23755) Drop down list
  // Adolescentes Revelados (23757) Drop down list
  // Mãe para Mãe (23759) Drop down list
  // Mãe Mentora (24031) Drop down list
  // Adolescente e Jovem Mentor (165324) Drop down list
  // Homem Campeão (165325) Drop down list
  // Outro Grupo de Apoio (23772) Text Input
  const onSubmit: SubmitHandler<Referencias> = (data) => {
    setValues(data);
  };
  return (
    <>
      <h4>Referências</h4>
      <StepForm values={values} onSubmit={onSubmit}>
        <Obs name="referralsOrdered" conceptUuid="e1da001c-1d5f-11e0-b929-000c29ad1d07" rendering="select" />
        <Obs name="otherReferral" conceptUuid="e1e0a278-1d5f-11e0-b929-000c29ad1d07" rendering="text" />
        <Obs name="eligibleSupportGroup" conceptUuid="d4f186d3-4ea4-4da9-aa6b-3ad658c25d18" rendering="select" />
        <Obs name="reveletedChildren" conceptUuid="70cb2221-d0bd-4e30-bbd5-7da8a3ba01ab" rendering="select" />
        <Obs name="fathersAndCaregivers" conceptUuid="7a72cf0c-5f43-436d-92d9-6f04cbb0a0b9" rendering="select" />
        <Obs name="reveletedAdolescents" conceptUuid="230c81e9-961f-478a-987d-3af637e83e5e" rendering="select" />
        <Obs name="motherToMother" conceptUuid="ae8d45d0-14b9-460e-888d-f883de83be26" rendering="select" />
        <Obs name="mentoringMother" conceptUuid="a1d858ea-3a19-41e1-879d-2457440e1d36" rendering="select" />
        <Obs name="youthAndTeenageMenthor" conceptUuid="4387180e-695f-4c99-8182-33e51907062a" rendering="select" />
        <Obs name="championMan" conceptUuid="b856b79b-2e8e-4764-ae8b-c8b509cdda76" rendering="select" />
        <Obs name="otherSupportGroup" conceptUuid="f22a9436-4ed4-401c-84ea-0c7dbf910639" rendering="text" />
      </StepForm>
    </>
  );
};

export default ReferenciasStep;
