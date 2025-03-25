import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useConsultationWorkflows } from '../hooks/useConsultationWorkflows';
import { type DefaultPatientWorkspaceProps, useLaunchWorkspaceRequiringVisit } from '@openmrs/esm-patient-common-lib';
import ConsultationsWorkflowsDashboard from './consultation-workflows-dashboard.component';

jest.mock('../hooks/useConsultationWorkflows', () => ({
  useConsultationWorkflows: jest.fn(),
}));

jest.mock('@openmrs/esm-patient-common-lib', () => ({
  ...jest.requireActual('@openmrs/esm-patient-common-lib'),
  useLaunchWorkspaceRequiringVisit: jest.fn(),
  EmptyDataIllustration: () => <div data-testid="empty-illustration" />,
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        noConsultationWorkflowsToDisplay: 'There are no consultation workflows to display.',
      };
      return translations[key] || key;
    },
  }),
}));

const createMockWorkspaceProps = (
  overrides: Partial<DefaultPatientWorkspaceProps> = {},
): DefaultPatientWorkspaceProps => ({
  patientUuid: 'test-patient-uuid',
  closeWorkspace: jest.fn(),
  promptBeforeClosing: jest.fn(),
  closeWorkspaceWithSavedChanges: jest.fn(),
  setTitle: jest.fn(),
  ...overrides,
});

const mockWorkflows = [
  {
    uuid: 'workflow-1',
    name: 'Test Workflow 1',
  },
  {
    uuid: 'workflow-2',
    name: 'Test Workflow 2',
  },
];

describe('ConsultationsWorkflowsDashboard', () => {
  const mockLaunchWorkspaceRequiringVisit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useLaunchWorkspaceRequiringVisit as jest.Mock).mockReturnValue(mockLaunchWorkspaceRequiringVisit);
  });

  it('renders loading skeleton when workflows are loading', () => {
    (useConsultationWorkflows as jest.Mock).mockReturnValue({
      consultationWorkflows: [],
      isLoading: true,
    });

    render(<ConsultationsWorkflowsDashboard {...createMockWorkspaceProps()} />);

    const skeleton = screen.getByRole('progressbar');
    expect(skeleton).toBeInTheDocument();
  });

  it('renders empty state when no workflows are available', () => {
    (useConsultationWorkflows as jest.Mock).mockReturnValue({
      consultationWorkflows: [],
      isLoading: false,
    });

    render(<ConsultationsWorkflowsDashboard {...createMockWorkspaceProps()} />);

    const emptyIllustration = screen.getByTestId('empty-illustration');
    const emptyStateMessage = screen.getByText('There are no consultation workflows to display.');

    expect(emptyIllustration).toBeInTheDocument();
    expect(emptyStateMessage).toBeInTheDocument();
  });

  it('renders consultation workflow list when workflows are available', () => {
    (useConsultationWorkflows as jest.Mock).mockReturnValue({
      consultationWorkflows: mockWorkflows,
      isLoading: false,
    });

    render(<ConsultationsWorkflowsDashboard {...createMockWorkspaceProps()} />);

    mockWorkflows.forEach((workflow) => {
      expect(screen.getByText(workflow.name)).toBeInTheDocument();
    });
  });

  it('automatically launches single workflow', async () => {
    const singleWorkflow = [mockWorkflows[0]];

    (useConsultationWorkflows as jest.Mock).mockReturnValue({
      consultationWorkflows: singleWorkflow,
      isLoading: false,
    });

    render(<ConsultationsWorkflowsDashboard {...createMockWorkspaceProps()} />);

    await waitFor(() => {
      expect(mockLaunchWorkspaceRequiringVisit).toHaveBeenCalledWith({
        workflowUuid: singleWorkflow[0].uuid,
        workflowsCount: 1,
      });
    });
  });

  it('can manually open a workflow', async () => {
    const user = userEvent.setup();

    (useConsultationWorkflows as jest.Mock).mockReturnValue({
      consultationWorkflows: mockWorkflows,
      isLoading: false,
    });

    render(<ConsultationsWorkflowsDashboard {...createMockWorkspaceProps()} />);

    const workflowToOpen = mockWorkflows[1];
    const workflowButton = screen.getByText(workflowToOpen.name);

    await user.click(workflowButton);

    expect(mockLaunchWorkspaceRequiringVisit).toHaveBeenCalledWith({
      workflowUuid: workflowToOpen.uuid,
      workflowsCount: mockWorkflows.length,
    });
  });
});
