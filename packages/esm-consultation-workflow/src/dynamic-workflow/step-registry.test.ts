import React from 'react';
import { render, screen } from '@testing-library/react';
import FormRenderer from './components/form-renderer.component';
import WidgetExtension from './components/widget-extension.component';
import MedicationStepRenderer from './components/medication-step-renderer.component';
import stepRegistry, { registerStep } from './step-registry';
import { WorkflowStep } from './types';
import ConditionsStepRenderer from './components/conditions-step-renderer.component';

// Mock the components
jest.mock('./components/form-renderer.component', () =>
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

describe('Step Registry', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registerStep', () => {
    it('should register a new step component', () => {
      // Arrange
      const TestComponent = jest.fn(() =>
        React.createElement('div', { 'data-testid': 'test-component' }, 'Test Component'),
      );

      // Act
      registerStep('test-step', TestComponent);

      // Assert
      expect(stepRegistry['test-step']).toBe(TestComponent);
    });
  });

  describe('Default registered steps', () => {
    const patientUuid = 'test-patient-uuid';
    const handleStepComplete = jest.fn();
    const onStepDataChange = jest.fn();

    it('should register the form step correctly', () => {
      // Arrange
      const step: WorkflowStep = {
        id: 'form-step-id',
        formId: 'test-form-uuid',
        renderType: 'form',
        title: 'Form Step',
      };

      // Act
      const StepComponent = stepRegistry['form'];
      render(
        React.createElement(StepComponent, {
          step,
          patientUuid,
          handleStepComplete: (data: any) => handleStepComplete(step.id, data),
          onStepDataChange: (data: any) => onStepDataChange(step.id, data),
        }),
      );

      // Assert
      expect(FormRenderer).toHaveBeenCalledWith(
        {
          formUuid: 'test-form-uuid',
          patientUuid,
          encounterUuid: '',
          onStepComplete: expect.any(Function),
          encounterTypeUuid: '',
        },
        {},
      );
    });

    it('should call handleStepComplete when form step is completed', () => {
      // Arrange
      const step: WorkflowStep = {
        id: 'form-step-id',
        formId: 'test-form-uuid',
        renderType: 'form',
        title: 'Form Step',
      };
      const mockData = { formData: 'test-data' };

      // Act
      const StepComponent = stepRegistry['form'];
      render(
        React.createElement(StepComponent, {
          step,
          patientUuid,
          handleStepComplete,
          onStepDataChange,
        }),
      );

      // Get the onStepComplete prop that was passed to FormRenderer
      const onStepComplete = (FormRenderer as jest.Mock).mock.calls[0][0].onStepComplete;

      // Call it with the mock data
      onStepComplete(mockData);

      // Assert
      expect(handleStepComplete).toHaveBeenCalledWith('form-step-id', mockData);
    });

    it('should register the conditions step correctly', () => {
      // Arrange
      const step: WorkflowStep = {
        id: 'conditions-step-id',
        renderType: 'conditions',
        title: 'Conditions Step',
      };

      // Act
      const StepComponent = stepRegistry['conditions'];
      render(
        React.createElement(StepComponent, {
          step,
          patientUuid,
          handleStepComplete,
          onStepDataChange,
        }),
      );

      // Assert
      expect(ConditionsStepRenderer).toHaveBeenCalledWith(
        {
          patientUuid,
          encounterUuid: '',
          onStepComplete: expect.any(Function),
          encounterTypeUuid: '',
        },
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
      render(
        React.createElement(StepComponent, {
          step,
          patientUuid,
          handleStepComplete,
          onStepDataChange,
        }),
      );

      // Assert
      expect(MedicationStepRenderer).toHaveBeenCalledWith(
        {
          patientUuid,
          encounterUuid: '',
          onStepComplete: expect.any(Function),
          encounterTypeUuid: '',
          onOrdersChange: expect.any(Function),
        },
        {},
      );
    });

    it('should call handleStepComplete when medications step is completed', () => {
      // Arrange
      const step: WorkflowStep = {
        id: 'medications-step-id',
        renderType: 'medications',
        title: 'Medications Step',
      };
      const mockData = { medicationData: 'test-data' };

      // Act
      const StepComponent = stepRegistry['medications'];
      render(
        React.createElement(StepComponent, {
          step,
          patientUuid,
          handleStepComplete,
          onStepDataChange,
        }),
      );

      // Get the onStepComplete prop that was passed to MedicationStepRenderer
      const onStepComplete = (MedicationStepRenderer as jest.Mock).mock.calls[0][0].onStepComplete;

      // Call it with the mock data
      onStepComplete(mockData);

      // Assert
      expect(handleStepComplete).toHaveBeenCalledWith('medications-step-id', mockData);
    });

    it('should call onStepDataChange when medication orders change', () => {
      // Arrange
      const step: WorkflowStep = {
        id: 'medications-step-id',
        renderType: 'medications',
        title: 'Medications Step',
      };
      const mockOrders = [{ orderId: '1', drugName: 'Test Drug' }];

      // Act
      const StepComponent = stepRegistry['medications'];
      render(
        React.createElement(StepComponent, {
          step,
          patientUuid,
          handleStepComplete,
          onStepDataChange,
        }),
      );

      // Get the onOrdersChange prop that was passed to MedicationStepRenderer
      const onOrdersChange = (MedicationStepRenderer as jest.Mock).mock.calls[0][0].onOrdersChange;

      // Call it with the mock orders
      onOrdersChange(mockOrders);

      // Assert
      expect(onStepDataChange).toHaveBeenCalledWith('medications-step-id', mockOrders);
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
          patientUuid,
          handleStepComplete,
          onStepDataChange,
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

    it('should handle undefined onStepDataChange gracefully', () => {
      // Arrange
      const step: WorkflowStep = {
        id: 'medications-step-id',
        renderType: 'medications',
        title: 'Medications Step',
      };
      const mockOrders = [{ orderId: '1', drugName: 'Test Drug' }];

      // Act - Not passing onStepDataChange
      const StepComponent = stepRegistry['medications'];
      render(
        React.createElement(StepComponent, {
          step,
          patientUuid,
          handleStepComplete,
          // onStepDataChange intentionally omitted
        }),
      );

      // Get the onOrdersChange prop
      const onOrdersChange = (MedicationStepRenderer as jest.Mock).mock.calls[0][0].onOrdersChange;

      // This should not throw an error
      expect(() => onOrdersChange(mockOrders)).not.toThrow();
    });
  });

  describe('Handling unknown step types', () => {
    it('should return undefined for an unregistered step type', () => {
      expect(stepRegistry['non-existent-type']).toBeUndefined();
    });
  });
});
