import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useTranslation } from 'react-i18next';

// Import as a default export
import * as openmrsFramework from '@openmrs/esm-framework';
import RegimenDrugOrderStepRenderer from './regimen-drug-order-step-renderer.component';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, fallback) => fallback || key,
  }),
}));

jest.mock('@openmrs/esm-framework', () => ({
  openmrsFetch: jest.fn(() => Promise.resolve({ data: { answers: [] } })),
  showSnackbar: jest.fn(),
  useSession: () => ({ sessionLocation: { uuid: 'loc-uuid' }, currentProvider: { uuid: 'prov-uuid' } }),
  useLayoutType: () => 'desktop',
  useConfig: () => ({}),
}));

jest.mock('@openmrs/esm-patient-common-lib', () => ({
  useOrderBasket: jest.fn(() => ({
    orders: [],
    clearOrders: jest.fn(),
  })),
}));

const defaultProps = {
  patientUuid: 'test-patient-uuid',
  stepId: 'step-1',
  encounterUuid: 'enc-uuid',
  encounterTypeUuid: 'enc-type-uuid',
  visitUuid: 'visit-uuid',
  onStepComplete: jest.fn(),
  onStepDataChange: jest.fn(),
};

describe('RegimenDrugOrderStepRenderer', () => {
  it('renders without crashing', () => {
    render(<RegimenDrugOrderStepRenderer {...defaultProps} />);
    expect(screen.getByText(/Dados do regime|regimenData/i)).toBeInTheDocument();
  });

  it('shows regimen select', () => {
    render(<RegimenDrugOrderStepRenderer {...defaultProps} />);
    const selects = screen.getAllByRole('combobox');
    expect(selects.some((sel) => sel.id === 'regimen-select')).toBe(true);
  });

  it('disables add medication button if no regimen is selected', () => {
    render(<RegimenDrugOrderStepRenderer {...defaultProps} />);
    const addButton = screen.getByRole('button', { name: /Adicionar Medicamento/i });
    expect(addButton).toBeDisabled();
  });
});
