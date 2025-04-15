interface CriteriaOption {
  label: string;
  value: string;
}

export interface ConditionOption {
  label: string;
  value: string;
  operators: string[];
  input: {
    type: 'number' | 'select' | 'boolean' | 'text';
    options?: CriteriaOption[];
    uri?: string;
    min?: number;
    max?: number;
  };
}

interface CriteriaDefinition {
  label: string;
  value: string;
  conditions?: ConditionOption[];
  uri?: string;
}

export const getCriteriaByValue = (value: string) => criteriaDefinitions.find((c) => c.value === value);

export const getConditionByValue = (criteriaValue: string, conditionValue: string): ConditionOption => {
  const criteria = getCriteriaByValue(criteriaValue);
  const condition = criteria?.conditions?.find((c) => c.value === conditionValue);

  if (condition) {
    return condition;
  }

  // Default fallback if no explicit condition match
  return {
    label: conditionValue,
    value: conditionValue,
    operators: ['=='],
    input: { type: 'text' },
  };
};

export const criteriaDefinitions: CriteriaDefinition[] = [
  {
    label: 'Patient Demographics',
    value: 'PATIENT_DEMOGRAPHICS',
    conditions: [
      {
        label: 'Age',
        value: 'age',
        operators: ['==', '!=', '>', '<', '>=', '<='],
        input: { type: 'number', min: 0, max: 120 },
      },
      {
        label: 'Sex',
        value: 'gender',
        operators: ['=='],
        input: {
          type: 'select',
          options: [
            { label: 'Male', value: "'M'" },
            { label: 'Female', value: "'F'" },
          ],
        },
      },
    ],
  },
  {
    label: 'Patient Attributes',
    value: 'PATIENT_ATTRIBUTES',
    uri: 'personattributetype?v=full',
  },
  {
    label: 'Patient Program',
    value: 'PROGRAM',
    conditions: [
      {
        label: 'Patient Program',
        value: 'program',
        operators: ['=='],
        input: { type: 'select', uri: 'program' },
      },
    ],
  },
  {
    label: 'Provider Role',
    value: 'PROVIDER_ROLE',
    conditions: [
      {
        label: 'Provider Role',
        value: 'provider',
        operators: ['=='],
        input: { type: 'select', uri: 'role?v=default' },
      },
    ],
  },
  {
    label: 'Visit Type',
    value: 'VISIT_TYPE',
    conditions: [
      {
        label: 'Patient First Visit',
        value: 'firstVisit',
        operators: ['=='],
        input: { type: 'boolean' },
      },
    ],
  },
];
