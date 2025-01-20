import { type FetchResponse, showSnackbar, useConfig, useLocations } from '@openmrs/esm-framework';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  mockCareProgramsResponse,
  mockEnrolledProgramsResponse,
  mockLocationsResponse,
  mockPatientIdentifiersResponse,
} from '__mocks__';
import React from 'react';
import { mockPatient } from 'tools';
import { type ConfigObject } from '../config-schema';
import ProgramsForm from './programs-form.workspace';
import {
  createProgramEnrollment,
  getIdentifierSource,
  hasGenerator,
  updateProgramEnrollment,
  useAvailablePrograms,
  useEnrollments,
  usePatientIdentifiers,
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
const mockUseConfig = jest.mocked(useConfig<ConfigObject>);
const mockUsePatientIdentifiers = jest.mocked(usePatientIdentifiers);
const mockHasGeneretor = jest.mocked(hasGenerator);
const mockGetIdentifierSource = jest.mocked(getIdentifierSource);

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
  data: mockEnrolledProgramsResponse,
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

mockUsePatientIdentifiers.mockReturnValue({
  data: mockPatientIdentifiersResponse,
  error: null,
  isLoading: false,
});

mockHasGeneretor.mockReturnValue(true);

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

  xit('updates a program enrollment', async () => {
    const user = userEvent.setup();

    renderProgramsForm(mockEnrolledProgramsResponse[0].uuid);

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
      mockEnrolledProgramsResponse[0].uuid,
      expect.objectContaining({
        dateCompleted: expect.stringMatching(/^2020-05-05/),
        dateEnrolled: expect.stringMatching(/^2020-01-16/),
        location: mockEnrolledProgramsResponse[0].location.uuid,
        patient: mockPatient.id,
        program: mockEnrolledProgramsResponse[0].program.uuid,
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
    it('should enable the identifier field', async () => {
      mockHasGeneretor.mockReturnValue(false);

      renderProgramsForm();

      expect(screen.getByRole('textbox', { name: /identifier/i })).not.toHaveAttribute('readonly');
    });
  });
});

function renderProgramsForm(programEnrollmentUuidToEdit?: string) {
  render(<ProgramsForm {...testProps} programEnrollmentId={programEnrollmentUuidToEdit} />);
}
