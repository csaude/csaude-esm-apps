import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type FetchResponse, navigate, openmrsFetch, showModal } from '@openmrs/esm-framework';
import Dashboard from './dashboard.component';
import { renderWithSwr, waitForLoadingToFinish } from '../../../../../tools/test-helpers';
import { deleteConsultationWorkflow } from '../../resources/consultation-workflow.resource';

type OpenmrsFetchResponse = Promise<
  FetchResponse<{
    results: Array<unknown>;
  }>
>;

const mockedOpenmrsFetch = jest.mocked(openmrsFetch);
const mockedDeleteConsultationWorkflow = jest.mocked(deleteConsultationWorkflow);
const mockedShowModal = jest.mocked(showModal);

const workflowsResponse = [
  {
    uuid: '2ddde996-b1c3-37f1-a53e-378dd1a4f6b5',
    name: 'Test Workflow 1',
    version: '1',
    published: true,
    retired: false,
    resourceValueReference: '92c4dad0-cbab-4316-b9a3-1a6e933707b0',
  },
];

jest.mock('../../resources/consultation-workflow.resource', () => ({
  deleteConsultationWorkflow: jest.fn(),
}));

global.window.URL.createObjectURL = jest.fn();

describe('Dashboard', () => {
  it('renders an empty state view if no workflows are available', async () => {
    mockedOpenmrsFetch.mockReturnValueOnce({ data: { results: [] } } as unknown as OpenmrsFetchResponse);

    renderDashboard();

    await waitForLoadingToFinish();

    expect(screen.getByText(/wizard workflow builder/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /workflows/i })).toBeInTheDocument();
    expect(screen.getByTitle(/empty data illustration/i)).toBeInTheDocument();
    expect(screen.getByText(/there are no workflows to display/i)).toBeInTheDocument();
    expect(screen.getByText(/create a new workflow/i)).toBeInTheDocument();
  });

  it('searches for a workflow by name and filters the list of forms', async () => {
    const user = userEvent.setup();

    mockedOpenmrsFetch.mockReturnValueOnce({
      data: {
        results: workflowsResponse,
      },
    } as unknown as OpenmrsFetchResponse);

    renderDashboard();

    await waitForLoadingToFinish();

    const searchbox: HTMLInputElement = screen.getByRole('searchbox');

    await user.type(searchbox, 'COVID');

    expect(searchbox.value).toBe('COVID');

    expect(screen.queryByText(/Test Workflow 1/i)).not.toBeInTheDocument();
    expect(screen.getByText(/no matching workflows to display/i)).toBeInTheDocument();
  });

  it('filters the list of workflows by "published" status', async () => {
    const user = userEvent.setup();

    mockedOpenmrsFetch.mockReturnValueOnce({
      data: {
        results: workflowsResponse,
      },
    } as unknown as OpenmrsFetchResponse);

    renderDashboard();

    await waitForLoadingToFinish();

    const publishStatusFilter = screen.getByRole('combobox', {
      name: /filter by/i,
    });

    await user.click(publishStatusFilter);
    await user.click(screen.getByRole('option', { name: /unpublished/i }));

    expect(screen.queryByText(/Test Workflow 1/i)).not.toBeInTheDocument();
    expect(screen.getByText(/no matching workflows to display/i)).toBeInTheDocument();
  });

  it('renders a list of workflows fetched from the server', async () => {
    mockedOpenmrsFetch.mockReturnValueOnce({
      data: {
        results: workflowsResponse,
      },
    } as unknown as OpenmrsFetchResponse);

    renderDashboard();

    await waitForLoadingToFinish();

    expect(screen.getByText(/wizard workflow builder/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /filter by/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create a new workflow/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /edit schema/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /download schema/i })).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: /filter table/i })).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText(workflowsResponse[0].name)).toBeInTheDocument();
  });

  it('clicking on "create a new workflow" button navigates to the "create form" page', async () => {
    const user = userEvent.setup();

    mockedOpenmrsFetch.mockReturnValueOnce({
      data: {
        results: workflowsResponse,
      },
    } as unknown as OpenmrsFetchResponse);

    renderDashboard();

    await waitForLoadingToFinish();

    const createFormButton = screen.getByRole('button', {
      name: /create a new workflow/i,
    });

    await user.click(createFormButton);

    expect(navigate).toHaveBeenCalledWith({
      to: expect.stringMatching(/wizard-workflow-builder\/new/),
    });
  });

  it("clicking the workflow name navigates to the form's edit page", async () => {
    mockedOpenmrsFetch.mockReturnValueOnce({
      data: {
        results: workflowsResponse,
      },
    } as unknown as OpenmrsFetchResponse);

    renderDashboard();

    await waitForLoadingToFinish();

    const link = screen.getByRole('link', { name: workflowsResponse[0].name });
    expect(link).toBeInTheDocument();
  });

  it('clicking on "edit schema" button navigates to the "edit schema" page', async () => {
    const user = userEvent.setup();

    mockedOpenmrsFetch.mockReturnValueOnce({
      data: {
        results: workflowsResponse,
      },
    } as unknown as OpenmrsFetchResponse);

    renderDashboard();

    await waitForLoadingToFinish();

    const editSchemaButton = screen.getByRole('button', {
      name: /edit schema/i,
    });

    await user.click(editSchemaButton);

    expect(navigate).toHaveBeenCalledWith({
      to: expect.stringMatching(/wizard-workflow-builder\/edit/),
    });
  });

  it('clicking on "download schema" button downloads the schema', async () => {
    const user = userEvent.setup();

    mockedOpenmrsFetch.mockReturnValueOnce({
      data: {
        results: workflowsResponse,
      },
    } as unknown as OpenmrsFetchResponse);

    renderDashboard();

    await waitForLoadingToFinish();

    const downloadSchemaButton = screen.getByRole('button', {
      name: /download schema/i,
    });

    await user.click(downloadSchemaButton);

    expect(window.URL.createObjectURL).toHaveBeenCalled();
  });

  it('clicking the "delete button" lets you delete a workflow', async () => {
    const user = userEvent.setup();

    mockedOpenmrsFetch.mockReturnValueOnce({
      data: {
        results: workflowsResponse,
      },
    } as unknown as OpenmrsFetchResponse);

    mockedDeleteConsultationWorkflow.mockResolvedValue({} as FetchResponse<Record<string, never>>);

    renderDashboard();

    await waitForLoadingToFinish();

    const deleteButton = screen.getByRole('button', { name: /delete schema/i });
    expect(deleteButton).toBeInTheDocument();

    await user.click(deleteButton);

    expect(mockedShowModal).toHaveBeenCalledTimes(1);
    expect(mockedShowModal).toHaveBeenCalledWith(
      'delete-workflow-modal',
      expect.objectContaining({
        isDeletingWorkflow: false,
      }),
    );
  });
});

function renderDashboard() {
  renderWithSwr(<Dashboard />);
}
