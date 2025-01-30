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
    answers: [
      { uuid: 'e1cdc68a-1d5f-11e0-b929-000c29ad1d07', display: 'HEPATITE' },
      { uuid: 'e1e0ff5c-1d5f-11e0-b929-000c29ad1d0', display: 'CHLAMYDIA' },
    ],
  },
};
const useConceptMock = jest.mocked(useConcept);

describe('obs', () => {
  it('should render', () => {
    const values = { sti: '' };
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

  it('should call useConcept with the conceptUuid', () => {
    const values = { sti: '' };
    const onSubmit = jest.fn();
    const conceptUuid = 'test-uuid';
    useConceptMock.mockReturnValue(stiConcept);
    render(
      <Wizard>
        <StepForm values={values} onSubmit={onSubmit}>
          <Obs rendering={'text'} conceptUuid={conceptUuid} name={'sti'} />
        </StepForm>
      </Wizard>,
    );
    expect(useConceptMock).toHaveBeenCalledWith(conceptUuid);
  });

  describe('hide', () => {
    it('should hide the field when hide is true', () => {
      const values = { sti: '' };
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

  describe('select', () => {
    it('should render a select', () => {
      const values = { sti: '' };
      const onSubmit = jest.fn();
      useConceptMock.mockReturnValue(stiConcept);
      render(
        <Wizard>
          <StepForm values={values} onSubmit={onSubmit}>
            <Obs rendering={'select'} conceptUuid={''} name={'sti'} />
          </StepForm>
        </Wizard>,
      );
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
    xit('should filter answers based on filterConceptUuid', () => {
      throw new Error('TODO');
    });
  });

  describe('number', () => {
    it('should render a number input', () => {
      const values = { sti: 0 };
      const onSubmit = jest.fn();
      useConceptMock.mockReturnValue(stiConcept);
      render(
        <Wizard>
          <StepForm values={values} onSubmit={onSubmit}>
            <Obs rendering={'number'} conceptUuid={''} name={'sti'} />
          </StepForm>
        </Wizard>,
      );
      expect(screen.getByRole('spinbutton')).toBeInTheDocument();
    });
  });

  describe('checkbox', () => {
    it('should render a multiple select', () => {
      const values = { sti: '' };
      const onSubmit = jest.fn();
      useConceptMock.mockReturnValue(stiConcept);
      render(
        <Wizard>
          <StepForm values={values} onSubmit={onSubmit}>
            <Obs rendering={'checkbox'} conceptUuid={''} name={'sti'} />
          </StepForm>
        </Wizard>,
      );
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });
    xit('should filter answers based on filterConceptUuid', () => {
      throw new Error('TODO');
    });
  });

  xdescribe('date', () => {
    it('should render a date input', () => {
      const values = { sti: '' };
      const onSubmit = jest.fn();
      useConceptMock.mockReturnValue(stiConcept);
      render(
        <Wizard>
          <StepForm values={values} onSubmit={onSubmit}>
            <Obs rendering={'date'} conceptUuid={''} name={'sti'} />
          </StepForm>
        </Wizard>,
      );
      // TODO: write better assertion
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
  });
});
