import React from 'react';
import { SWRConfig } from 'swr';
import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';

const swrWrapper = ({ children }) => {
  return (
    <SWRConfig
      value={{
        dedupingInterval: 0,
        provider: () => new Map(),
      }}>
      {children}
    </SWRConfig>
  );
};

export const renderWithSwr = (ui, options?) => render(ui, { wrapper: swrWrapper, ...options });

export function waitForLoadingToFinish() {
  return waitForElementToBeRemoved(() => [...screen.queryAllByRole('progressbar')], {
    timeout: 4000,
  });
}

export const mockPatient = {
  resourceType: 'Patient',
  id: '8673ee4f-e2ab-4077-ba55-4980f408773e',
  extension: [
    {
      url: 'http://fhir-es.transcendinsights.com/stu3/StructureDefinition/resource-date-created',
      valueDateTime: '2017-01-18T09:42:40+00:00',
    },
    {
      url: 'https://purl.org/elab/fhir/StructureDefinition/Creator-crew-version1',
      valueString: 'daemon',
    },
  ],
  identifier: [
    {
      id: '1f0ad7a1-430f-4397-b571-59ea654a52db',
      use: 'secondary',
      system: 'Old Identification Number',
      value: '100732HE',
    },
    {
      id: '1f0ad7a1-430f-4397-b571-59ea654a52db',
      use: 'usual',
      system: 'OpenMRS ID',
      value: '100GEJ',
    },
  ],
  active: true,
  name: [
    {
      id: 'efdb246f-4142-4c12-a27a-9be60b9592e9',
      use: 'usual',
      family: 'Wilson',
      given: ['John'],
    },
  ],
  gender: 'male',
  birthDate: '1972-04-04',
  deceasedBoolean: false,
  address: [],
};

export const mockPatientWithLongName = {
  ...mockPatient,
  name: [
    {
      id: 'efdb246f-4142-4c12-a27a-9be60b9592e9',
      use: 'usual',
      family: 'family name',
      given: ['Some very long given name'],
    },
  ],
};
