export const QueryBuilderConfig = [
  {
    type: 'demographics',
    text: 'Dados demograficos',
    criterias: [
      {
        name: 'age',
        fields: [
          { name: 'Operator', value: ['o1', 'o2'], renderType: 'select' },
          { name: 'Value', value: '', renderType: 'number' },
        ],
      },
      {
        name: 'sex',
        fields: [
          { name: 'Operator', value: ['o1', 'o2'], renderType: 'select' },
          { name: 'Sex', value: ['male', 'female'], renderType: 'select' },
        ],
      },
    ],
  },
  {
    type: 'patient-attributes',
    text: 'Atributos do paciente',
    criterias: [
      {
        name: 'pregnancy',
        fields: [
          { name: 'Operator', value: ['o1', 'o2'], renderType: 'select' },
          { name: 'Value', value: '', renderType: 'boolean' },
        ],
      },
      {
        name: 'sex',
        fields: [
          { name: 'Operator', value: ['o1', 'o2'], renderType: 'select' },
          { name: 'Sex', value: ['male', 'female'], renderType: 'select' },
        ],
      },
    ],
  },
  {
    type: 'provider',
    text: 'Perfil do provedor',
    criterias: [
      {
        name: 'age',
        fields: [
          { name: 'Operator', value: ['o1', 'o2'], renderType: 'select' },
          { name: 'Value', value: '', renderType: 'number' },
        ],
      },
      {
        name: 'sex',
        fields: [{ name: 'Sex', value: ['male', 'female'], renderType: 'select' }],
      },
    ],
  },
  {
    type: 'patient-program',
    text: 'Programa do paciente',
    criterias: [
      {
        name: 'age',
        fields: [
          { name: 'Operator', value: ['o1', 'o2'], renderType: 'select' },
          { name: 'Value', value: '', renderType: 'number' },
        ],
      },
      {
        name: 'sex',
        fields: [{ name: 'Sex', value: ['male', 'female'], renderType: 'select' }],
      },
    ],
  },
  {
    type: 'visit-type',
    text: 'Tipo da visita',
    criterias: [
      {
        name: 'age',
        fields: [
          { name: 'Operator', value: ['o1', 'o2'], renderType: 'select' },
          { name: 'Value', value: '', renderType: 'number' },
        ],
      },
      {
        name: 'sex',
        fields: [{ name: 'Sex', value: ['male', 'female'], renderType: 'select' }],
      },
    ],
  },
];
