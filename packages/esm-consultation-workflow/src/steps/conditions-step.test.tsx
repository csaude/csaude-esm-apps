import { act, render, screen } from '@testing-library/react';
import React from 'react';
import ConditionsStep from './conditions-step.component';
import { type UseConditionsHook, useConditions } from './step-hooks';
import { ErrorState } from '@openmrs/esm-framework';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';

interface Condition {
  text: string;
  clinicalStatus: string;
  onsetDateTime: string;
}

jest.mock('./step-hooks', () => ({
  useConditions: jest.fn(),
}));

jest.mock('@openmrs/esm-patient-common-lib', () => ({
  launchPatientWorkspace: jest.fn(),
  EmptyState: jest.fn(({ launchForm }) => (
    <>
      <p>There are no conditions to display for this patient</p>
      <button onClick={launchForm} data-testid="launch-conditions-form-button">
        Add Conditions
      </button>
    </>
  )),
}));

const useConditionsMock = jest.mocked(useConditions);

function getCondition(conditions: Condition[], isLoading: boolean = false, error: Error = null): UseConditionsHook {
  return {
    isLoading: isLoading,
    error: error,
    conditions: conditions.map((condition) => ({
      fullUrl: '',
      resource: {
        id: '',
        clinicalStatus: {
          coding: [
            {
              code: condition.clinicalStatus,
              system: '',
            },
          ],
        },
        onsetDateTime: condition.onsetDateTime,
        code: {
          text: condition.text,
        },
      },
    })),
    mutate: jest.fn(),
  };
}

describe('ConditionsStep Component', () => {
  it('should render without crashing', () => {
    const conditions = [
      {
        text: 'TUBERCULOSE PULMONAR',
        clinicalStatus: 'active',
        onsetDateTime: '2025-01-16T00:00:00Z',
      },
    ];
    useConditionsMock.mockReturnValue(getCondition(conditions));
    render(<ConditionsStep patientUuid="some-uuid" />);
    expect(screen.getByText('Conditions')).toBeInTheDocument();
  });

  it('should display a list of conditions', () => {
    const conditions = [
      {
        text: 'TUBERCULOSE PULMONAR',
        clinicalStatus: 'active',
        onsetDateTime: '2025-01-16T00:00:00Z',
      },
    ];
    useConditionsMock.mockReturnValue(getCondition(conditions));
    render(<ConditionsStep patientUuid="some-uuid" />);
    expect(screen.getByText(conditions[0].text)).toBeInTheDocument();
  });

  it('should display an error message when there is an error', () => {
    const errorMessage = 'An error occurred';
    useConditionsMock.mockReturnValue({
      isLoading: false,
      error: new Error('An error occurred'),
      conditions: [],
      mutate: jest.fn(),
    });
    render(<ConditionsStep patientUuid="some-uuid" />);
    expect(ErrorState).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ message: errorMessage }),
      }),
      expect.anything(),
    );
  });

  describe('empty conditions list', () => {
    it('should display an empty state when there are no conditions', () => {
      useConditionsMock.mockReturnValue({
        isLoading: false,
        error: null,
        conditions: [],
        mutate: jest.fn(),
      });
      render(<ConditionsStep patientUuid="some-uuid" />);
      expect(screen.getByText('There are no conditions to display for this patient')).toBeInTheDocument();
    });

    describe('launch conditions workspace', () => {
      it('should launch the conditions form workspace when the add conditions button is clicked', async () => {
        useConditionsMock.mockReturnValue({
          isLoading: false,
          error: null,
          conditions: [],
          mutate: jest.fn(),
        });
        render(<ConditionsStep patientUuid="some-uuid" />);
        const launchConditionsFormButton = screen.getByTestId('launch-conditions-form-button');
        expect(launchConditionsFormButton).toBeInTheDocument();
        await act(async () => {
          launchConditionsFormButton.click();
        });

        expect(launchPatientWorkspace).toHaveBeenCalledWith('conditions-form-workspace', {
          closeWorkspaceWithSavedChanges: expect.any(Function),
        });
      });

      xit('should update the conditions list once the conditions workspace is saved', async () => {
        throw Error('Not implemented');
      });
    });
  });
});
