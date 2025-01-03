import React from 'react';
import { SubmitHandler } from 'react-hook-form';
import StepForm from '../form/step-form.component';
import Obs from '../form/obs.component';
import { StepFormComponent, type AvaliacaoDeAdesao } from '../types';

const AvaliacaoDeAdesaoStep: StepFormComponent<AvaliacaoDeAdesao> = ({ values, setValues }) => {
  // Avaliação de Adesão (6223) Drop down list
  // Efeitos Secundários ARV (2015) Check box
  // Efeitos Secundários de INH (23762) Drop down list
  // Efeitos Secundários CTZ (23763) Drop down list
  const onSubmit: SubmitHandler<AvaliacaoDeAdesao> = (data) => {
    setValues(data);
  };
  return (
    <>
      <h4>Avaliação de adesão do paciente</h4>
      <StepForm values={values} onSubmit={onSubmit}>
        <Obs name="adherence" conceptUuid="983773e6-d42c-4ad3-89a7-9191a8b8d52b" rendering="select" />
        <Obs name="arvSideEffects" conceptUuid="e1e07ece-1d5f-11e0-b929-000c29ad1d07" rendering="checkbox" />
        <Obs name="inhSideEffect" conceptUuid="01ce78dd-074b-407c-ba30-27ec9336e0f8" rendering="select" />
        <Obs name="ctzSideEffect" conceptUuid="689cd895-eb45-4712-9b41-8756bc0514ed" rendering="select" />
      </StepForm>
    </>
  );
};

export default AvaliacaoDeAdesaoStep;
