import React from 'react';
import { SubmitHandler } from 'react-hook-form';
import StepForm from '../form/step-form.component';
import Obs from '../form/obs.component';
import { AvaliacaoNutricional, StepFormComponent } from '../types';

const AvaliacaoNutricionalStep: StepFormComponent<AvaliacaoNutricional> = ({ values, setValues }) => {
  // Indicador de Avaliação Nutricional (23738) Drop down list
  // Classificação de Desnutrição (6336) Drop down list
  const onSubmit: SubmitHandler<AvaliacaoNutricional> = (data) => {
    setValues(data);
  };
  return (
    <>
      <h4>Avaliação nutricional - adulto</h4>
      <StepForm values={values} onSubmit={onSubmit}>
        <Obs name="indicator" conceptUuid="4b4280d6-976d-4b0d-90b3-e28adb431f61" rendering="select" />
        <Obs
          name="classificationOfMalnutrition"
          conceptUuid="0b1a2c8c-55d2-42a8-a3d6-62828f52d49a"
          rendering="select"
        />
      </StepForm>
    </>
  );
};

export default AvaliacaoNutricionalStep;
