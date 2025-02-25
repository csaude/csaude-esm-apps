import { type FetchResponse, showSnackbar, useConfig, useLocations } from '@openmrs/esm-framework';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  mockCareProgramsResponse,
  mockEnrolledProgramsResponse as mockEnrollmentsResponse,
  mockLocationsResponse,
  mockExistingIdentifiersResponse,
} from '__mocks__';
import React from 'react';
import { mockPatient } from 'tools';
import ProgramsForm from './programs-form.workspace';
import {
  createProgramEnrollment,
  hasIdentifier,
  updateProgramEnrollment,
  useAvailablePrograms,
  useEnrollments,
  useExistingPatientIdentifier,
} from './programs.resource';

jest.mock('./programs.resource');

const mockUseAvailablePrograms = jest.mocked(useAvailablePrograms);
const mockUseEnrollments = jest.mocked(useEnrollments);
const mockCreateProgramEnrollment = jest.mocked(createProgramEnrollment);
const mockUpdateProgramEnrollment = jest.mocked(updateProgramEnrollment);
const mockShowSnackbar = jest.mocked(showSnackbar);
const mockUseLocations = jest.mocked(useLocations);
const mockCloseWorkspace = jest.fn();
const mockCloseWorkspaceWithSavedChanges = jest.fn();
const mockPromptBeforeClosing = jest.fn();
const mockHasGeneretor = jest.mocked(hasIdentifier);
const mockUseExistingPatientIdentifier = jest.mocked(useExistingPatientIdentifier);

const testProps = {
  closeWorkspace: mockCloseWorkspace,
  closeWorkspaceWithSavedChanges: mockCloseWorkspaceWithSavedChanges,
  patientUuid: mockPatient.id,
  promptBeforeClosing: mockPromptBeforeClosing,
  setTitle: jest.fn(),
};

mockUseLocations.mockReturnValue(mockLocationsResponse);

mockUseAvailablePrograms.mockReturnValue({
  data: mockCareProgramsResponse,
  eligiblePrograms: [],
  error: null,
  isLoading: false,
});

mockUseEnrollments.mockReturnValue({
  data: mockEnrollmentsResponse,
  error: null,
  isLoading: false,
  isValidating: false,
  activeEnrollments: [],
  mutateEnrollments: jest.fn(),
});

mockCreateProgramEnrollment.mockResolvedValue({
  status: 201,
  statusText: 'Created',
} as unknown as FetchResponse);

mockHasGeneretor.mockReturnValue(true);

mockUseExistingPatientIdentifier.mockReturnValue({
  data: null,
  error: null,
  isLoading: false,
});

describe('ProgramsForm', () => {
  it('renders a success toast notification upon successfully recording a program enrollment', async () => {
    const user = userEvent.setup();

    const inpatientWardUuid = 'b1a8b05e-3542-4037-bbd3-998ee9c40574';
    const tarvCuidadoProgramUuid = '7b2e4a0a-d4eb-4df7-be30-78ca4b28ca99';

    renderProgramsForm();

    const programNameInput = screen.getByRole('combobox', { name: /program name/i });
    const enrollmentDateInput = screen.getByRole('textbox', { name: /date enrolled/i });
    const enrollmentLocationInput = screen.getByRole('combobox', { name: /enrollment location/i });
    const enrollButton = screen.getByRole('button', { name: /save and close/i });

    await user.click(enrollButton);
    expect(screen.getByText(/program is required/i)).toBeInTheDocument();

    await user.type(enrollmentDateInput, '2020-05-05');
    await user.selectOptions(programNameInput, [tarvCuidadoProgramUuid]);
    await user.selectOptions(enrollmentLocationInput, [inpatientWardUuid]);
    expect(screen.getByRole('option', { name: /Inpatient Ward/i })).toBeInTheDocument();

    await user.click(enrollButton);

    expect(mockCreateProgramEnrollment).toHaveBeenCalledTimes(1);
    expect(mockCreateProgramEnrollment).toHaveBeenCalledWith(
      expect.objectContaining({
        dateCompleted: null,
        location: inpatientWardUuid,
        patient: mockPatient.id,
        program: tarvCuidadoProgramUuid,
      }),
      null,
      new AbortController(),
    );

    expect(mockCloseWorkspaceWithSavedChanges).toHaveBeenCalledTimes(1);
    expect(mockShowSnackbar).toHaveBeenCalledTimes(1);
    expect(mockShowSnackbar).toHaveBeenCalledWith({
      subtitle: 'It is now visible in the Programs table',
      kind: 'success',
      title: 'Program enrollment saved',
    });
  });

  it('updates a program enrollment', async () => {
    const user = userEvent.setup();

    renderProgramsForm(mockEnrollmentsResponse[0].patientProgram.uuid);

    const enrollButton = screen.getByRole('button', { name: /save and close/i });
    const completionDateInput = screen.getByRole('textbox', { name: /date completed/i });

    mockUpdateProgramEnrollment.mockResolvedValue({
      status: 200,
      statusText: 'OK',
    } as unknown as FetchResponse);

    await user.type(completionDateInput, '05/05/2020');
    await user.tab();
    await user.click(enrollButton);

    expect(mockUpdateProgramEnrollment).toHaveBeenCalledTimes(1);
    expect(mockUpdateProgramEnrollment).toHaveBeenCalledWith(
      mockEnrollmentsResponse[0],
      expect.objectContaining({
        dateCompleted: expect.stringMatching(/^2020-05-05/),
        dateEnrolled: expect.stringMatching(/^2020-01-16/),
        location: mockEnrollmentsResponse[0].patientProgram.location.uuid,
        patient: mockPatient.id,
        program: mockEnrollmentsResponse[0].patientProgram.program.uuid,
      }),
      new AbortController(),
    );

    expect(mockShowSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({
        subtitle: 'Changes to the program are now visible in the Programs table',
        kind: 'success',
        title: 'Program enrollment updated',
      }),
    );
  });

  describe('when a compatible identifier already exists', () => {
    it('should prefill the identifier field', async () => {
      const user = userEvent.setup();

      mockUseExistingPatientIdentifier.mockReturnValue({
        data: mockExistingIdentifiersResponse[0],
        error: null,
        isLoading: false,
      });

      renderProgramsForm();

      expect(screen.getByRole('textbox', { name: /identifier/i })).toHaveValue(
        mockExistingIdentifiersResponse[0].identifier,
      );
    });
  });

  describe('when transfer from other facility checked', () => {
    it('should enable the identifier field', async () => {
      const user = userEvent.setup();

      renderProgramsForm();

      const transferCheckbox = screen.getByRole('checkbox', { name: /transfer from other facility/i });

      expect(screen.getByRole('textbox', { name: /identifier/i })).toHaveAttribute('readonly');

      await user.click(transferCheckbox);

      expect(screen.getByRole('textbox', { name: /identifier/i })).not.toHaveAttribute('readonly');
    });
  });

  describe('when a program without an identifier source is chosen', () => {
    it('should hide the identifier field', async () => {
      mockHasGeneretor.mockReturnValue(false);

      renderProgramsForm();

      expect(screen.queryByRole('textbox', { name: /identifier/i })).toBeNull();
    });
  });
});

function renderProgramsForm(programEnrollmentUuidToEdit?: string) {
  render(<ProgramsForm {...testProps} programEnrollmentId={programEnrollmentUuidToEdit} />);
}
