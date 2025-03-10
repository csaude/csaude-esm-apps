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
    patientProgram: {
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
    patientIdentifier: null,
  },
];

export const mockEnrolledInAllProgramsResponse = [
  {
    patientProgram: {
      uuid: '0bd9c046-f495-49e4-82a8-fdb92a88880c',
      display: 'SERVICO TARV - TRATAMENTO',
      dateEnrolled: '2020-01-16T00:00:00.000+0000',
      program: {
        name: 'SERVICO TARV - TRATAMENTO',
        uuid: 'efe2481f-9e75-4515-8d5a-86bfde2b5ad3',
        retired: false,
        description: 'Programa de seguimento e tratamento aos pacientes HIV+',
        concept: {
          uuid: 'be53ec04-d2ae-485e-9a6c-e167deef9a95',
          display: 'SERVICO TARV - TRATAMENTO',
        },
      },
      states: [],
    },
  },
  {
    patientProgram: {
      uuid: '39dee7fd-b8b2-41e8-8e81-e47f32470942',
      display: 'SERVICO TARV - CUIDADO',
      dateEnrolled: '2020-01-16T00:00:00.000+0000',
      program: {
        name: 'SERVICO TARV - CUIDADO',
        uuid: '7b2e4a0a-d4eb-4df7-be30-78ca4b28ca99',
        retired: false,
        description: 'Programa de seguimento e cuidado aos pacientes HIV+',
        concept: {
          uuid: 'e1de7d54-1d5f-11e0-b929-000c29ad1d07',
          display: 'SERVICO TARV - CUIDADO',
        },
      },
      states: [],
    },
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
  {
    uuid: 'efe2481f-9e75-4515-8d5a-86bfde2b5ad3',
    display: 'SERVICO TARV - TRATAMENTO',
    name: 'SERVICO TARV - TRATAMENTO',
    concept: {
      uuid: 'be53ec04-d2ae-485e-9a6c-e167deef9a95',
      display: 'SERVICO TARV - TRATAMENTO',
    },
    allWorkflows: [
      {
        uuid: 'a59bd818-d2f0-4a9a-a2f2-0a54af4ce04e',
        retired: false,
        concept: {
          uuid: '7f3af436-5c3a-447c-9012-42bb314e03db',
          display: 'TARV',
        },
        states: [
          {
            uuid: '05cf5297-12ed-4f6b-8c21-70d8ae04e09f',
            concept: {
              uuid: 'e1de1fee-1d5f-11e0-b929-000c29ad1d07',
              display: 'SUSPENDER TRATAMENTO',
            },
          },
          {
            uuid: 'ef06e6df-6026-4d5a-88f9-b2c3e0495dc8',
            concept: {
              uuid: 'e1da7d3a-1d5f-11e0-b929-000c29ad1d07',
              display: 'TRANSFERIDO DE',
            },
          },
          {
            uuid: 'c50d6bdc-8a79-43ae-ab45-abbaa6b45e7d',
            concept: {
              uuid: '4a7bec6f-8f27-4da5-b78d-40134c30d3ee',
              display: 'ACTIVO NO PROGRAMA',
            },
          },
          {
            uuid: '9f2f86e9-303c-4b98-a6ae-37e8806a6f47',
            concept: {
              uuid: 'e1de1cf6-1d5f-11e0-b929-000c29ad1d07',
              display: 'TRANSFERIDO PARA',
            },
          },
          {
            uuid: '06124f77-4a49-49f8-8655-fa1fe5262936',
            concept: {
              uuid: 'e1de1df0-1d5f-11e0-b929-000c29ad1d07',
              display: 'ABANDONO',
            },
          },
          {
            uuid: 'fcad8a57-2a1a-4abd-84b7-935897e4fe06',
            concept: {
              uuid: 'e1da766e-1d5f-11e0-b929-000c29ad1d07',
              display: 'OBITOU',
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

export const mockExistingIdentifiersResponse = [
  {
    uuid: 'cb1201bb-4bdf-4643-bc7a-ae15a5dcd45b',
    identifier: '0111010201/2025/00002',
    preferred: false,
    identifierType: {
      uuid: 'e2b966d0-1d5f-11e0-b929-000c29ad1d07',
      display: 'NID (SERVICO TARV)',
    },
  },
  {
    uuid: '60b323b2-d007-4ee3-a2e9-edfd33f5a593',
    identifier: '0111010223/2025/00002',
    preferred: false,
    identifierType: {
      uuid: 'bce7c891-27e9-42ec-abb0-aec3a641175e',
      display: 'NID PREP',
    },
  },
  {
    uuid: 'ffe246db-8651-4dce-adec-9a2066fc10bf',
    identifier: '0111010224/2025/99999',
    preferred: false,
    identifierType: {
      uuid: 'e2b97b70-1d5f-11e0-b929-000c29ad1d07',
      display: 'NID (CCR)',
    },
  },
];
