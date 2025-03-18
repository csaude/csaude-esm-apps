export interface CurrentCriteria {
  criteriaType: string;
  condition: string;
  operator: string;
  value: string;
}

export const criteriaTypes = [
  'PATIENT_DEMOGRAPHICS',
  'PATIENT_ATTRIBUTES',
  'PROVIDER',
  'PATIENT_PROGRAM',
  'VISIT_TYPE',
];

export const conditionsByType = {
  PATIENT_DEMOGRAPHICS: ['age', 'gender', 'race', 'zipCode'],
  PATIENT_ATTRIBUTES: ['diagnosis', 'procedure', 'hospitalization'],
  PROVIDER: ['bloodPressure', 'cholesterol', 'glucose'],
  PATIENT_PROGRAM: ['currentMedication', 'pastMedication', 'allergies'],
  VISIT_TYPE: ['currentMedication', 'pastMedication', 'allergies'],
};

export const operatorsByCondition = {
  age: ['==', '>', '<', '>=', '<='],
  gender: ['=='],
  race: ['=='],
  zipCode: ['==', 'startsWith'],
  diagnosis: ['contains', 'equals', 'notEquals'],
  procedure: ['performed', 'notPerformed'],
  hospitalization: ['within', 'notWithin'],
  bloodPressure: ['>', '<', 'between'],
  cholesterol: ['>', '<', 'between'],
  glucose: ['>', '<', 'between'],
  currentMedication: ['taking', 'notTaking'],
  pastMedication: ['took', 'neverTook'],
  allergies: ['has', 'doesNotHave'],
};

export const inputTypesByCondition = {
  age: { type: 'number', min: 0, max: 120 },
  gender: {
    type: 'select',
    options: ['Male', 'Female', 'Other', 'Unknown'],
  },
  race: {
    type: 'select',
    options: ['White', 'Black', 'Asian', 'Hispanic', 'Other', 'Unknown'],
  },
  zipCode: { type: 'text', pattern: '[0-9]{5}' },
  diagnosis: {
    type: 'select',
    options: ['Diabetes', 'Hypertension', 'Asthma', 'COPD', 'Cancer', 'Other'],
  },
  procedure: {
    type: 'select',
    options: ['Surgery', 'MRI', 'CT Scan', 'X-Ray', 'Blood Test', 'Other'],
  },
  hospitalization: { type: 'text', placeholder: 'e.g., 6 months' },
  bloodPressure: { type: 'number', min: 0, max: 300 },
  cholesterol: { type: 'number', min: 0, max: 500 },
  glucose: { type: 'number', min: 0, max: 1000 },
  currentMedication: {
    type: 'select',
    options: ['Antibiotics', 'Antidepressants', 'Statins', 'Painkillers', 'Other'],
  },
  pastMedication: {
    type: 'select',
    options: ['Antibiotics', 'Antidepressants', 'Statins', 'Painkillers', 'Other'],
  },
  allergies: {
    type: 'select',
    options: ['Penicillin', 'Latex', 'Peanuts', 'Shellfish', 'Other'],
  },
};
