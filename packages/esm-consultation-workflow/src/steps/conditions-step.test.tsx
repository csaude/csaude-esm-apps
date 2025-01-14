import { render, screen } from '@testing-library/react';
import React from 'react';
import ConditionsStep from './conditions-step.component';
import { type UseConditionsHook, useConditions } from './step-hooks';

jest.mock('./step-hooks', () => ({
  useConditions: jest.fn(),
}));

const useConditionsMock = jest.mocked(useConditions);

function getCondition(text: string[], isLoading: boolean = false, error: Error = null): UseConditionsHook {
  return {
    isLoading: isLoading,
    error: error,
    conditions: text.map((t) => ({
      fullUrl: '',
      resource: {
        id: '',
        clinicalStatus: true,
        code: {
          text: t,
        },
      },
    })),
    mutate: jest.fn(),
  };
}

describe('ConditionsStep Component', () => {
  it('should render without crashing', () => {
    const condition = 'TUBERCULOSE PULMONAR';
    useConditionsMock.mockReturnValue(getCondition([condition]));
    render(<ConditionsStep patientUuid="some-uuid" />);
    expect(screen.getByText('Conditions')).toBeInTheDocument();
  });

  it('should display a list of conditions', () => {
    throw Error('Not implemented');
  });

  it('should display an error message when there is an error', () => {
    throw Error('Not implemented');
  });

  describe('empty conditions list', () => {
    it('should display an empty state when there are no conditions', () => {
      throw Error('Not implemented');
    });

    describe('launch conditions workspace', () => {
      it('should launch the conditions form workspace when the add conditions button is clicked', () => {
        throw Error('Not implemented');
      });

      it('should update the conditions list once the conditions workspace is saved', () => {
        throw Error('Not implemented');
      });
    });
  });
});
