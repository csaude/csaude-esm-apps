import { NullablePatient, showModal, useLayoutType, Visit } from '@openmrs/esm-framework';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import type { WorkflowConfig } from '../types';
import { useWorkflow, WorkflowProvider } from '../workflow-context';
import AppointmentsStepRenderer from './appointments-step-renderer.component';
import { Appointment, AppointmentKind, AppointmentStatus } from '../resources/patient-appointments.resource';

jest.mock('../types');

jest.mock('@openmrs/esm-framework', () => ({
  closeWorkspace: jest.fn(),
  useLayoutType: jest.fn(),
  formatDatetime: jest.fn(() => '01/01/2023'),
  parseDate: jest.fn((dateString) => new Date(dateString)),
  showModal: jest.fn(),
}));

jest.mock('@openmrs/esm-patient-common-lib', () => ({
  ErrorState: jest.fn(() => <div data-testid="error-state"></div>),
  EmptyState: jest.fn(() => <div data-testid="empty-state"></div>),
  launchPatientWorkspace: jest.fn(),
}));

let workflowConfig: jest.Mocked<WorkflowConfig>;
let visit: jest.Mocked<Visit>;
let patient: jest.Mocked<NullablePatient>;
const mockWorkflowProviderProps = {
  workflowConfig: workflowConfig,
  patientUuid: 'patient-uuid',
  visit: visit,
  patient: patient,
  onCancel: jest.fn(),
  onComplete: jest.fn(),
};

const mockAppointments: Appointment[] = [
  {
    appointmentKind: AppointmentKind.SCHEDULED,
    appointmentNumber: 'APPT12345',
    comments: 'Patient requested a follow-up on last visit.',
    endDateTime: new Date('2025-04-05T15:30:00'),
    location: {
      uuid: 'loc123',
      name: 'Main Hospital - Room 101',
    },
    patient: {
      identifier: 'pt-12345',
      identifiers: [
        { identifier: '123456', identifierName: 'National ID' },
        { identifier: '987654', identifierName: 'Insurance ID' },
      ],
      name: 'John Doe',
      uuid: 'patient-uuid-123',
      age: '45',
      gender: 'Male',
    },
    provider: {
      uuid: 'provider-uuid-1',
      name: 'Dr. Jane Smith',
      resource: 'Provider',
    },
    providers: [
      {
        uuid: 'provider-uuid-2',
        name: 'Dr. John Brown',
        resource: 'Provider',
      },
    ],
    recurring: false,
    service: {
      appointmentServiceId: 101,
      creatorName: 'Admin',
      description: 'General Checkup',
      durationMins: 30,
      endTime: '15:30',
      initialAppointmentStatus: AppointmentStatus.SCHEDULED,
      maxAppointmentsLimit: 5,
      name: 'General Checkup',
      uuid: 'service-uuid-001',
      startTime: '15:00',
      serviceTypes: [
        {
          duration: 30,
          name: 'Routine Checkup',
          uuid: 'service-type-uuid-01',
        },
      ],
      color: '#4CAF50',
      startTimeTimeFormat: 'PM',
      endTimeTimeFormat: 'PM',
    },
    startDateTime: new Date('2025-04-05T15:00:00'),
    dateAppointmentScheduled: new Date('2025-03-30T10:00:00'),
    status: AppointmentStatus.SCHEDULED,
    uuid: 'appointment-uuid-12345',
    additionalInfo: 'Patient prefers early afternoon appointments.',
    serviceTypes: [
      {
        duration: 30,
        name: 'Routine Checkup',
        uuid: 'service-type-uuid-01',
      },
    ],
    voided: false,
    extensions: {},
    teleconsultationLink: null,
  },
  {
    appointmentKind: AppointmentKind.WALKIN,
    appointmentNumber: 'APPT67890',
    comments: 'Patient walked in for an urgent consultation.',
    endDateTime: new Date('2025-04-06T12:00:00'),
    location: {
      uuid: 'loc456',
      name: 'Urgent Care Center - Room 202',
    },
    patient: {
      identifier: 'pt-67890',
      identifiers: [
        { identifier: '678901', identifierName: 'National ID' },
        { identifier: '112233', identifierName: 'Insurance ID' },
      ],
      name: 'Alice Smith',
      uuid: 'patient-uuid-456',
      age: '34',
      gender: 'Female',
    },
    provider: {
      uuid: 'provider-uuid-3',
      name: 'Dr. Emily White',
      resource: 'Provider',
    },
    providers: [
      {
        uuid: 'provider-uuid-4',
        name: 'Dr. Michael Johnson',
        resource: 'Provider',
      },
    ],
    recurring: false,
    service: {
      appointmentServiceId: 102,
      creatorName: 'Admin',
      description: 'Urgent Consultation',
      durationMins: 15,
      endTime: '12:00',
      initialAppointmentStatus: AppointmentStatus.SCHEDULED,
      maxAppointmentsLimit: 10,
      name: 'Urgent Consultation',
      uuid: 'service-uuid-002',
      startTime: '11:45',
      serviceTypes: [
        {
          duration: 15,
          name: 'Urgent Consultation',
          uuid: 'service-type-uuid-02',
        },
      ],
      color: '#FF5722',
      startTimeTimeFormat: 'AM',
      endTimeTimeFormat: 'AM',
    },
    startDateTime: new Date('2025-04-06T11:45:00'),
    dateAppointmentScheduled: new Date('2025-04-06T10:30:00'),
    status: AppointmentStatus.SCHEDULED,
    uuid: 'appointment-uuid-67890',
    additionalInfo: 'Patient is experiencing acute pain.',
    serviceTypes: [
      {
        duration: 15,
        name: 'Urgent Consultation',
        uuid: 'service-type-uuid-02',
      },
    ],
    voided: false,
    extensions: {},
    teleconsultationLink: null,
  },
];

jest.mock('../workflow-context', () => ({
  ...jest.requireActual('../workflow-context'),
  useWorkflow: jest.fn(),
}));

describe('AppointmentsStepRenderer', () => {
  const stepId = 'step-1-appointments';

  const mockAppointmentsStepData = (appointments: Appointment[]) => ({
    state: { stepsData: { [stepId]: { appointments } } },
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty state when appointments array is empty', () => {
    (useLayoutType as jest.Mock).mockReturnValue('large-desktop');
    (useWorkflow as jest.Mock).mockReturnValue(mockAppointmentsStepData([]));

    render(
      <WorkflowProvider {...mockWorkflowProviderProps}>
        <AppointmentsStepRenderer
          stepId={stepId}
          encounterTypeUuid=""
          encounterUuid=""
          patientUuid="test-uuid"
          onStepComplete={jest.fn()}
        />
      </WorkflowProvider>,
    );

    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });

  it('renders AppointmentsSummaryTable on tablet layout', () => {
    (useLayoutType as jest.Mock).mockReturnValue('tablet');
    (useWorkflow as jest.Mock).mockReturnValue(mockAppointmentsStepData(mockAppointments));

    render(
      <WorkflowProvider {...mockWorkflowProviderProps}>
        <AppointmentsStepRenderer
          stepId={stepId}
          encounterTypeUuid=""
          encounterUuid=""
          patientUuid="test-uuid"
          onStepComplete={jest.fn()}
        />
      </WorkflowProvider>,
    );

    expect(screen.getByText('General Checkup')).toBeInTheDocument();
    expect(screen.getByText('Patient requested a follow-up on last visit.')).toBeInTheDocument();
  });

  it('renders AppointmentsSummaryCard on desktop layout', () => {
    (useLayoutType as jest.Mock).mockReturnValue('large-desktop');
    (useWorkflow as jest.Mock).mockReturnValue(mockAppointmentsStepData(mockAppointments));

    render(
      <AppointmentsStepRenderer
        stepId={stepId}
        encounterTypeUuid=""
        encounterUuid=""
        patientUuid="test-uuid"
        onStepComplete={jest.fn()}
      />,
    );

    expect(screen.getByText('General Checkup')).toBeInTheDocument();
    expect(screen.getByText('Patient requested a follow-up on last visit.')).toBeInTheDocument();
  });

  it('launches appointments form when add button is clicked', () => {
    (useLayoutType as jest.Mock).mockReturnValue('large-desktop');
    const mutateMock = jest.fn();
    render(
      <AppointmentsStepRenderer
        stepId={stepId}
        encounterTypeUuid=""
        encounterUuid=""
        patientUuid="test-uuid"
        onStepComplete={jest.fn()}
      />,
    );

    const addButton = screen.getByText('Adicionar');
    fireEvent.click(addButton);

    expect(launchPatientWorkspace).toHaveBeenCalledWith('appointments-form-workspace', expect.any(Object));
  });

  it('launches edit appointments form when edit button is clicked', () => {
    (useLayoutType as jest.Mock).mockReturnValue('large-desktop');
    const mutateMock = jest.fn();
    render(
      <AppointmentsStepRenderer
        stepId={stepId}
        encounterTypeUuid=""
        encounterUuid=""
        patientUuid="test-uuid"
        onStepComplete={jest.fn()}
      />,
    );

    const editButtons = screen.getAllByLabelText('Editar');
    fireEvent.click(editButtons[0]);

    expect(launchPatientWorkspace).toHaveBeenCalledWith('appointments-form-workspace', expect.anything());
  });

  it('launches cancel confirmation dialog when delete button is clicked', () => {
    (useLayoutType as jest.Mock).mockReturnValue('large-desktop');
    const mutateMock = jest.fn();
    render(
      <AppointmentsStepRenderer
        stepId={stepId}
        encounterTypeUuid=""
        encounterUuid=""
        patientUuid="test-uuid"
        onStepComplete={jest.fn()}
      />,
    );

    const cancelButtons = screen.getAllByLabelText('Cancelar');
    fireEvent.click(cancelButtons[0]);

    expect(showModal).toHaveBeenCalledWith(
      'cancel-appointment-modal',
      expect.objectContaining({
        appointmentUuid: 'appointment-uuid-12345',
        patientUuid: 'test-uuid',
      }),
    );
  });
});
