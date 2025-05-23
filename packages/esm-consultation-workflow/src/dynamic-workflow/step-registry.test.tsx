import React, { forwardRef } from 'react';
import { render } from '@testing-library/react';
import FormStepRenderer from './components/form-step-renderer.component';
import WidgetExtension from './components/widget-extension.component';
import MedicationStepRenderer from './components/medication-step-renderer.component';
import stepRegistry, { registerStep } from './step-registry';
import { type WorkflowStep } from './types';
import ConditionsStepRenderer from './components/conditions-step-renderer.component';
import AppointmentsStepRenderer from './components/appointments-step-renderer.component';

// Mock the components
jest.mock('./components/form-step-renderer.component', () =>
  jest.fn(() => React.createElement('div', { 'data-testid': 'form-renderer' }, 'Form Renderer')),
);
jest.mock('./components/widget-extension.component', () =>
  jest.fn(() => React.createElement('div', { 'data-testid': 'widget-extension' }, 'Widget extension')),
);
jest.mock('./components/medication-step-renderer.component', () =>
  jest.fn(() => React.createElement('div', { 'data-testid': 'medication-step-renderer' }, 'Medication Step Renderer')),
);
jest.mock('./components/conditions-step-renderer.component', () =>
  jest.fn(() => React.createElement('div', { 'data-testid': 'conditions-step-renderer' }, 'Conditions Step Renderer')),
);
jest.mock('./components/appointments-step-renderer.component', () =>
  jest.fn(() =>
    React.createElement('div', { 'data-testid': 'appointments-step-renderer' }, 'Appointments Step Renderer'),
  ),
);

describe('Step Registry', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registerStep', () => {
    it('should register a new step component', () => {
      // Arrange
      const TestComponent = forwardRef(() => <div data-testid="test-component">Test Component</div>);

      // Act
      registerStep('test-step', TestComponent);

      // Assert
      expect(stepRegistry['test-step']).toBe(TestComponent);
    });
  });

  describe('Default registered steps', () => {
    const patientUuid = 'test-patient-uuid';

    it('should register the form step correctly', () => {
      // Arrange
      const step: WorkflowStep = {
        id: 'form-step-id',
        formId: 'test-form-uuid',
        renderType: 'form',
        title: 'Form Step',
        initiallyOpen: true,
      };

      const mockEncounter = 'mockEncounter';

      // Act
      const StepComponent = stepRegistry['form'];
      render(<StepComponent step={step} stepData={{ encounter: mockEncounter }} patientUuid={patientUuid} />);

      // Assert
      expect(FormStepRenderer).toHaveBeenCalledWith(
        expect.objectContaining({
          formUuid: step.formId,
          patientUuid,
          encounter: mockEncounter,
          initiallyOpen: true,
        }),
        {},
      );
    });

    it('should register the conditions step correctly', () => {
      const stepId = 'conditions-step-id';
      // Arrange
      const step: WorkflowStep = {
        id: stepId,
        renderType: 'conditions',
        title: 'Conditions Step',
        initiallyOpen: true,
      };

      const mockConditions = [];

      // Act
      const StepComponent = stepRegistry['conditions'];
      render(<StepComponent step={step} stepData={{ conditions: mockConditions }} patientUuid={patientUuid} />);

      // Assert
      expect(ConditionsStepRenderer).toHaveBeenCalledWith(
        expect.objectContaining({
          patientUuid,
          conditions: mockConditions,
          initiallyOpen: true,
        }),
        {},
      );
    });

    it('should register the medications step correctly', () => {
      // Arrange
      const step: WorkflowStep = {
        id: 'medications-step-id',
        renderType: 'medications',
        title: 'Medications Step',
      };

      // Act
      const StepComponent = stepRegistry['medications'];
      render(<StepComponent step={step} stepData={null} patientUuid={patientUuid} />);

      // Assert
      expect(MedicationStepRenderer).toHaveBeenCalledWith(
        expect.objectContaining({
          patientUuid,
        }),
        {},
      );
    });

    it('should register the appointments step correctly', () => {
      const stepId = 'appointments-step-id';
      // Arrange
      const step: WorkflowStep = {
        id: stepId,
        renderType: 'appointments',
        title: 'Appointments Step',
      };

      const mockAppointments = [];
      // Act
      const StepComponent = stepRegistry['appointments'];
      render(<StepComponent step={step} stepData={{ appointments: mockAppointments }} patientUuid={patientUuid} />);

      // Assert
      expect(AppointmentsStepRenderer).toHaveBeenCalledWith(
        expect.objectContaining({
          patientUuid,
          appointments: mockAppointments,
        }),
        {},
      );
    });

    it('should register the form-workspace step correctly', () => {
      // Arrange
      const step: WorkflowStep = {
        id: 'form-workspace-step-id',
        renderType: 'form-workspace',
        title: 'Form Workspace Step',
      };

      // Act
      const StepComponent = stepRegistry['form-workspace'];
      render(
        React.createElement(StepComponent, {
          step,
          stepData: null,
          patientUuid,
        }),
      );

      // Assert
      expect(WidgetExtension).toHaveBeenCalledWith(
        {
          patientUuid,
          stepId: 'form-workspace-step-id',
          extensionId: 'drug-order-panel',
        },
        {},
      );
    });
  });

  describe('Handling unknown step types', () => {
    it('should return undefined for an unregistered step type', () => {
      expect(stepRegistry['non-existent-type']).toBeUndefined();
    });
  });
});
