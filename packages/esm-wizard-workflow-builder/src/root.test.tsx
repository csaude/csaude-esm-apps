import React from 'react';
import { render, screen } from '@testing-library/react';
import { useConfig } from '@openmrs/esm-framework';
// import { Config } from './config-schema';
import Root from './root.component';

/**
 * This is an idiomatic way of dealing with mocked files. Note that
 * `useConfig` is already mocked; the Jest moduleNameMapper (see the
 * Jest config) has mapped the `@openmrs/esm-framework` import to a
 * mock file. This line just tells TypeScript that the object is, in
 * fact, a mock, and so will have methods like `mockReturnValue`.
 */
// const mockUseConfig = jest.mocked(useConfig<Config>);

xit('renders a landing page for the Template app', () => {
  throw Error('Not implemented');
});
