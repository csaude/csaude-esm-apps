import { render, screen } from '@testing-library/react';
import React from 'react';
import { Wizard } from 'react-use-wizard';
import { useConcept } from './form-hooks';
import Obs from './obs.component';
import StepForm from './step-form.component';

jest.mock('./form-hooks', () => ({ useConcept: jest.fn() }));

const stiConcept = {
  isLoading: false,
  error: null,
  concept: {
    uuid: 'e1cfe1e0-1d5f-11e0-b929-000c29ad1d07',
    display: 'sti',
    answers: [{ uuid: 'e1cdc68a-1d5f-11e0-b929-000c29ad1d07', display: 'HEPATITE' }],
  },
};
const useConceptMock = jest.mocked(useConcept);

describe('obs', () => {
  it('should render', () => {
    const values = { sti: null };
    const onSubmit = jest.fn();
    useConceptMock.mockReturnValue(stiConcept);
    render(
      <Wizard>
        <StepForm values={values} onSubmit={onSubmit}>
          <Obs rendering={'text'} conceptUuid={''} name={'sti'} />
        </StepForm>
      </Wizard>,
    );
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('shuould hide the field when hide is true', () => {
    const values = { sti: null };
    const onSubmit = jest.fn();
    useConceptMock.mockReturnValue(stiConcept);
    render(
      <Wizard>
        <StepForm values={values} onSubmit={onSubmit}>
          <Obs rendering={'text'} conceptUuid={''} name={'sti'} hide={() => true} />
        </StepForm>
      </Wizard>,
    );
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  describe('hide', () => {
    it('should be called with the form values', () => {
      const values = { sti: 'e1cdc68a-1d5f-11e0-b929-000c29ad1d07' };
      const onSubmit = jest.fn();
      const hide = jest.fn();
      useConceptMock.mockReturnValue(stiConcept);
      render(
        <Wizard>
          <StepForm values={values} onSubmit={onSubmit}>
            <Obs rendering={'text'} conceptUuid={''} name={'sti'} hide={hide} />
          </StepForm>
        </Wizard>,
      );
      expect(hide).toHaveBeenCalledWith(values);
    });
  });
});
