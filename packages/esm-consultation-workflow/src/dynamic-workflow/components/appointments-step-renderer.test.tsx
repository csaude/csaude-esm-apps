// import React from 'react';
// import { render, screen } from '@testing-library/react';
// import '@testing-library/jest-dom';
// import { useTranslation } from 'react-i18next';
// import { Appointment, useAppointments } from '../resources/patient-appointments.resource';
// import AppointmentsStepRenderer, { ApppointmentsActionMenu } from './appointments-step-renderer.component';

// enum AppointmentKind {
//   SCHEDULED = 'Scheduled',
//   WALKIN = 'WalkIn',
//   VIRTUAL = 'Virtual',
// }

// enum AppointmentStatus {
//   SCHEDULED = 'Scheduled',
//   CANCELLED = 'Cancelled',
//   MISSED = 'Missed',
//   CHECKEDIN = 'CheckedIn',
//   COMPLETED = 'Completed',
// }

// jest.mock('react-i18next', () => ({
//   useTranslation: jest.fn(),
// }));

// jest.mock('../resources/patient-appointments.resource', () => ({
//   useAppointments: jest.fn(),
// }));

// jest.mock('@openmrs/esm-patient-common-lib', () => ({
//   launchPatientWorkspace: jest.fn(),
// }));

// jest.mock('@openmrs/esm-framework', () => ({
//   formatDatetime: jest.fn((date) => (date ? date.toISOString() : '——')),
//   parseDate: jest.fn((date) => (date instanceof Date ? date : new Date(date))),
//   closeWorkspace: jest.fn(),
//   showModal: jest.fn(),
//   useLayoutType: jest.fn().mockReturnValue('small-desktop'),
// }));

// const createMockAppointment = (overrides: Partial<Appointment> = {}): Appointment => ({
//   appointmentKind: AppointmentKind.SCHEDULED,
//   appointmentNumber: 'APP-001',
//   comments: 'Test appointment',
//   endDateTime: new Date(),
//   location: {
//     uuid: 'location-uuid',
//     name: 'Test Location',
//   },
//   patient: {
//     identifier: 'PATIENT-001',
//     identifiers: [{ identifier: 'PATIENT-001' }],
//     name: 'John Doe',
//     uuid: 'patient-uuid',
//     age: '30',
//     gender: 'Male',
//   },
//   provider: {
//     uuid: 'provider-uuid',
//     display: 'Dr. Test',
//   },
//   providers: [],
//   recurring: false,
//   service: {
//     appointmentServiceId: 1,
//     creatorName: 'Admin',
//     description: 'Test Service',
//     durationMins: 30,
//     endTime: '17:00',
//     initialAppointmentStatus: 'Scheduled',
//     maxAppointmentsLimit: null,
//     name: 'Consultation',
//     startTime: '09:00',
//     uuid: 'service-uuid',
//   },
//   startDateTime: new Date().toISOString(),
//   dateAppointmentScheduled: new Date().toISOString(),
//   status: AppointmentStatus.SCHEDULED,
//   uuid: 'appointment-uuid',
//   voided: false,
//   extensions: {},
//   teleconsultationLink: null,
//   ...overrides,
// });

// describe('AppointmentsStepRenderer', () => {
//   const mockTranslation = {
//     t: jest.fn((key) => key),
//   };

//   beforeEach(() => {
//     (useTranslation as jest.Mock).mockReturnValue(mockTranslation);
//   });

//   const mockOnStepComplete = jest.fn();
//   const mockPatientUuid = 'test-patient-uuid';

//   it('renders different appointment types', () => {
//     const mockAppointments = {
//       upcomingAppointments: [
//         createMockAppointment({
//           appointmentKind: AppointmentKind.SCHEDULED,
//           status: AppointmentStatus.SCHEDULED,
//         }),
//         createMockAppointment({
//           appointmentKind: AppointmentKind.VIRTUAL,
//           status: AppointmentStatus.SCHEDULED,
//           teleconsultationLink: 'https://test-link.com',
//         }),
//       ],
//       todaysAppointments: [
//         createMockAppointment({
//           appointmentKind: AppointmentKind.WALKIN,
//           status: AppointmentStatus.CHECKEDIN,
//         }),
//       ],
//       pastAppointments: [
//         createMockAppointment({
//           status: AppointmentStatus.COMPLETED,
//         }),
//         createMockAppointment({
//           status: AppointmentStatus.MISSED,
//         }),
//       ],
//     };

//     (useAppointments as jest.Mock).mockReturnValue({
//       appointments: mockAppointments,
//       error: null,
//       isLoading: false,
//       mutate: jest.fn(),
//     });

//     render(
//       <AppointmentsStepRenderer
//         encounterTypeUuid=""
//         encounterUuid=""
//         patientUuid={mockPatientUuid}
//         onStepComplete={mockOnStepComplete}
//       />,
//     );

//     expect(screen.getByText('upcoming')).toBeInTheDocument();
//     expect(screen.getByText('today')).toBeInTheDocument();
//     expect(screen.getByText('past')).toBeInTheDocument();
//   });

//   it('handles different appointment statuses', () => {
//     const mockAppointments = {
//       upcomingAppointments: [
//         createMockAppointment({
//           status: AppointmentStatus.SCHEDULED,
//           comments: 'Regular checkup',
//           service: {
//             ...createMockAppointment().service,
//             name: 'General Consultation',
//             color: '#00FF00',
//           },
//         }),
//       ],
//       todaysAppointments: [],
//       pastAppointments: [],
//     };

//     (useAppointments as jest.Mock).mockReturnValue({
//       appointments: mockAppointments,
//       error: null,
//       isLoading: false,
//       mutate: jest.fn(),
//     });

//     render(
//       <AppointmentsStepRenderer
//         encounterTypeUuid=""
//         encounterUuid=""
//         patientUuid={mockPatientUuid}
//         onStepComplete={mockOnStepComplete}
//       />,
//     );

//     expect(screen.getByText('General Consultation')).toBeInTheDocument();
//     expect(screen.getByText('Regular checkup')).toBeInTheDocument();
//   });
// });

// describe('ApppointmentsActionMenu', () => {
//   const mockPatientUuid = 'test-patient-uuid';
//   const mockMutate = jest.fn();

//   beforeEach(() => {
//     (useTranslation as jest.Mock).mockReturnValue({
//       t: jest.fn((key) => key),
//     });
//   });

//   it('handles different appointment kinds', () => {
//     const virtualAppointment = createMockAppointment({
//       appointmentKind: AppointmentKind.VIRTUAL,
//       teleconsultationLink: 'https://virtual-meeting.com',
//     });

//     render(
//       <ApppointmentsActionMenu appointment={virtualAppointment} patientUuid={mockPatientUuid} mutate={mockMutate} />,
//     );

//     expect(screen.getByLabelText('edit')).toBeInTheDocument();
//     expect(screen.getByLabelText('cancel')).toBeInTheDocument();
//   });

//   it('handles non-editable appointment statuses', () => {
//     const completedAppointment = createMockAppointment({
//       status: AppointmentStatus.COMPLETED,
//     });

//     render(
//       <ApppointmentsActionMenu appointment={completedAppointment} patientUuid={mockPatientUuid} mutate={mockMutate} />,
//     );

//     expect(screen.getByLabelText('edit')).toBeInTheDocument();
//     expect(screen.getByLabelText('cancel')).toBeInTheDocument();
//   });
// });
