export const mockOncProgramResponse = {
  uuid: '46bd14b8-2357-42a2-8e16-262e8f0057d7',
  patient: {
    uuid: '90f7f0b4-06a8-4a97-9678-e7a977f4b518',
    display: '10010W - John Taylor',
  },
  program: {
    uuid: '11b129ca-a5e7-4025-84bf-b92a173e20de',
    name: 'Oncology Screening and Diagnosis',
    allWorkflows: [],
  },
  display: 'Oncology Screening and Diagnosis',
  dateEnrolled: '2020-01-25T00:00:00.000+0000',
  dateCompleted: '2020-04-14T00:00:00.000+0000',
  location: {
    uuid: '58c57d25-8d39-41ab-8422-108a0c277d98',
    display: 'Outpatient Clinic',
  },
  voided: false,
  outcome: null,
  states: [],
  resourceVersion: '1.8',
};

export const mockEnrolledProgramsResponse = [
  {
    uuid: '8ba6c08f-66d9-4a18-a233-5f658b1755bf',
    program: {
      display: 'Human immunodeficiency virus (HIV) disease',
      uuid: '64f950e6-1b07-4ac0-8e7e-f3e148f3463f',
      name: 'HIV Care and Treatment',
      allWorkflows: [],
      concept: {
        uuid: '70724784-438a-490e-a581-68b7d1f8f47f',
        display: 'Human immunodeficiency virus (HIV) disease',
      },
    },
    display: 'HIV Care and Treatment',
    location: {
      uuid: 'aff27d58-a15c-49a6-9beb-d30dcfc0c66e',
      display: 'Amani Hospital',
    },
    dateEnrolled: '2020-01-16T00:00:00.000+0000',
    dateCompleted: null,
    states: [],
  },
];

export const mockEnrolledInAllProgramsResponse = [
  {
    uuid: '8ba6c08f-66d9-4a18-a233-5f658b1755bf',
    program: {
      uuid: '64f950e6-1b07-4ac0-8e7e-f3e148f3463f',
      name: 'HIV Care and Treatment',
      allWorkflows: [],
      concept: {
        uuid: '70724784-438a-490e-a581-68b7d1f8f47f',
        display: 'Human immunodeficiency virus (HIV) disease',
      },
    },
    display: 'HIV Care and Treatment',
    location: {
      uuid: 'aff27d58-a15c-49a6-9beb-d30dcfc0c66e',
      display: 'Amani Hospital',
    },
    dateEnrolled: '2020-01-16T00:00:00.000+0000',
    dateCompleted: null,
    states: [],
  },
  {
    uuid: '700b7914-9dc9-4569-8fe3-6db6c80af4c5',
    program: {
      uuid: '11b129ca-a5e7-4025-84bf-b92a173e20de',
      name: 'Oncology Screening and Diagnosis',
      allWorkflows: [],
    },
    display: 'Oncology Screening and Diagnosis',
    location: {
      uuid: 'aff27d58-a15c-49a6-9beb-d30dcfc0c66e',
      display: 'Amani Hospital',
    },
    dateEnrolled: '2021-03-16T00:00:00.000+0000',
    dateCompleted: null,
    states: [],
  },
  {
    uuid: '874e5326-faa0-4d4b-a891-9a0e3a16f30f',
    program: {
      uuid: 'b2f65a51-2f87-4faa-a8c6-327a0c1d2e17',
      name: 'HIV Differentiated Care',
      allWorkflows: [],
    },
    display: 'HIV Differentiated Care',
    location: {
      uuid: 'aff27d58-a15c-49a6-9beb-d30dcfc0c66e',
      display: 'Amani Hospital',
    },
    dateEnrolled: '2021-02-16T00:00:00.000+0000',
    dateCompleted: null,
    states: [],
  },
];

export const mockCareProgramsResponse = [
  {
    uuid: '7b2e4a0a-d4eb-4df7-be30-78ca4b28ca99',
    name: 'SERVICO TARV - CUIDADO',
    display: 'SERVICO TARV - CUIDADO',
    concept: {
      uuid: 'e1de7d54-1d5f-11e0-b929-000c29ad1d07',
      display: 'SERVICO TARV - CUIDADO',
    },
    allWorkflows: [
      {
        uuid: 'beea7be9-cbf5-4a15-923a-ff193eea9d50',
        retired: false,
        concept: {
          uuid: '44f812e8-c4c0-40cd-aef3-6b1ef76d43e1',
          display: 'PRE-TARV',
        },
        states: [
          {
            uuid: '1761fab2-32b8-46e6-b171-7ca6ad92971c',
            concept: {
              uuid: 'e1d9ef28-1d5f-11e0-b929-000c29ad1d07',
              display: 'INICIAR',
            },
          },
          {
            uuid: 'bc1b79f9-97e2-46c5-b6e3-dd87301cacb0',
            concept: {
              uuid: 'e1da766e-1d5f-11e0-b929-000c29ad1d07',
              display: 'OBITOU',
            },
          },
          {
            uuid: 'b227d4ff-2dc3-4c18-9a58-d4de8d077746',
            concept: {
              uuid: 'e1da7d3a-1d5f-11e0-b929-000c29ad1d07',
              display: 'TRANSFERIDO DE',
            },
          },
          {
            uuid: 'e21bd1bf-13a8-4cb7-8d7b-fb830771f64a',
            concept: {
              uuid: '4a7bec6f-8f27-4da5-b78d-40134c30d3ee',
              display: 'ACTIVO NO PROGRAMA',
            },
          },
          {
            uuid: '8e27ada6-bcac-49c8-a15b-be0a8404ea6c',
            concept: {
              uuid: 'e1de1df0-1d5f-11e0-b929-000c29ad1d07',
              display: 'ABANDONO',
            },
          },
          {
            uuid: '6f67b68d-f04d-4644-bac1-c9926b08a768',
            concept: {
              uuid: 'e1de1cf6-1d5f-11e0-b929-000c29ad1d07',
              display: 'TRANSFERIDO PARA',
            },
          },
        ],
      },
    ],
  },
];

export const mockProgramsResponse = {
  headers: null,
  ok: true,
  redirected: true,
  status: 200,
  statusText: 'ok',
  trailer: null,
  type: null,
  url: '',
  clone: null,
  body: null,
  bodyUsed: null,
  arrayBuffer: null,
  blob: null,
  formData: null,
  json: null,
  text: null,
  data: {
    results: [
      {
        uuid: 'b033f8c3-7e0b-4118-aa1d-76c550f2978d',
        program: {
          uuid: '64f950e6-1b07-4ac0-8e7e-f3e148f3463f',
          name: 'HIV Care and Treatment',
          allWorkflows: [],
          links: [
            {
              rel: 'self',
              uri: 'http://localhost:8090/openmrs/ws/rest/v1/program/64f950e6-1b07-4ac0-8e7e-f3e148f3463f',
            },
          ],
        },
        display: 'HIV Care and Treatment',
        dateEnrolled: '2019-11-01T00:00:00.000+0000',
        dateCompleted: null,
        links: [
          {
            rel: 'self',
            uri: 'http://localhost:8090/openmrs/ws/rest/v1/programenrollment/b033f8c3-7e0b-4118-aa1d-76c550f2978d',
          },
          {
            rel: 'full',
            uri: 'http://localhost:8090/openmrs/ws/rest/v1/programenrollment/b033f8c3-7e0b-4118-aa1d-76c550f2978d?v=full',
          },
        ],
      },
    ],
  },
};

export const mockLocationsResponse = [
  {
    uuid: 'aff27d58-a15c-49a6-9beb-d30dcfc0c66e',
    display: 'Amani Hospital',
  },
  {
    uuid: 'b1a8b05e-3542-4037-bbd3-998ee9c40574',
    display: 'Inpatient Ward',
  },
  {
    uuid: '2131aff8-2e2a-480a-b7ab-4ac53250262b',
    display: 'Isolation Ward',
  },
  {
    uuid: '7fdfa2cb-bc95-405a-88c6-32b7673c0453',
    display: 'Laboratory',
  },
];

export const mockPatientIdentifiersResponse = new Map([
  [
    'e2b966d0-1d5f-11e0-b929-000c29ad1d07',
    {
      display: 'NID (SERVICO TARV) = 0104010701/2024/00010',
      uuid: '53e1afa0-df20-47e8-bb0b-460571eeefc5',
      identifier: '0104010701/2024/00010',
      identifierType: {
        uuid: 'e2b966d0-1d5f-11e0-b929-000c29ad1d07',
        display: 'NID (SERVICO TARV)',
        links: [
          {
            rel: 'self',
            uri: 'http://localhost/openmrs/ws/rest/v1/patientidentifiertype/e2b966d0-1d5f-11e0-b929-000c29ad1d07',
            resourceAlias: 'patientidentifiertype',
          },
        ],
      },
      location: {
        uuid: 'c9c8c8bb-67b3-41f7-948a-c58ae02dca46',
        display: 'CS 24 de Julho',
        links: [
          {
            rel: 'self',
            uri: 'http://localhost/openmrs/ws/rest/v1/location/c9c8c8bb-67b3-41f7-948a-c58ae02dca46',
            resourceAlias: 'location',
          },
        ],
      },
      preferred: false,
      voided: false,
      links: [
        {
          rel: 'self',
          uri: 'http://localhost/openmrs/ws/rest/v1/patient/ef9c0c79-adf2-4d63-8d5f-20dd4c010a58/identifier/53e1afa0-df20-47e8-bb0b-460571eeefc5',
          resourceAlias: 'identifier',
        },
        {
          rel: 'full',
          uri: 'http://localhost/openmrs/ws/rest/v1/patient/ef9c0c79-adf2-4d63-8d5f-20dd4c010a58/identifier/53e1afa0-df20-47e8-bb0b-460571eeefc5?v=full',
          resourceAlias: 'identifier',
        },
      ],
      resourceVersion: '1.8',
    },
  ],
]);
