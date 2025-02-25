import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { showModal } from '@openmrs/esm-framework';
import { type FormSchema } from '@openmrs/esm-form-engine-lib';
import { type Schema } from '../../types';
import InteractiveBuilder from './interactive-builder.component';

const mockShowModal = jest.mocked(showModal);

describe('InteractiveBuilder', () => {
  it('renders the interactive builder', async () => {
    const user = userEvent.setup();
    renderInteractiveBuilder();

    const startBuildingButton = screen.getByRole('button', { name: /start building/i });
    expect(startBuildingButton).toBeInTheDocument();
    await user.click(startBuildingButton);

    expect(mockShowModal).toHaveBeenCalledTimes(1);
    expect(mockShowModal).toHaveBeenCalledWith('new-workflow-modal', {
      closeModal: expect.any(Function),
      schema: {},
      onSchemaChange: expect.any(Function),
    });
  });

  it('populates the interactive builder with the provided schema', () => {
    const dummySchema: Schema = {
      name: 'Sample Wizad Flow',
      steps: [
        {
          id: 'step-1',
          title: 'First Step',
          renderType: 'medications',
          skippable: true,
        },
        {
          id: 'step-2',
          title: 'Second Step',
          renderType: 'orders',
          skippable: true,
        },
      ],
    };

    renderInteractiveBuilder({ schema: dummySchema });
    expect(screen.getByRole('button', { name: /add step/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: dummySchema.name })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: dummySchema.steps[0].title })).toBeInTheDocument();
  });
});

function renderInteractiveBuilder(props = {}) {
  const defaultProps = {
    isLoading: false,
    onSchemaChange: jest.fn(),
    schema: {} as Schema,
    validationResponse: [],
  };

  render(<InteractiveBuilder {...defaultProps} {...props} />);
}
