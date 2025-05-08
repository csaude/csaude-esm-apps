/**
 * Constants for the Regimen Drug Order component
 */

export const REGIMEN_CONCEPT = 'e1d83e4e-1d5f-11e0-b929-000c29ad1d07';
export const THERAPEUTIC_LINE_CONCEPT = 'fdff0637-b36f-4dce-90c7-fe9f1ec586f0';
export const CHANGE_LINE_CONCEPT = 'e1d9f252-1d5f-11e0-b929-000c29ad1d07';
export const YES_CONCEPT = '1065AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
export const ART_CHANGE_JUSTIFICATION_CONCEPT = 'e1de8862-1d5f-11e0-b929-000c29ad1d07';

// Allowed frequencies for medication
export const ALLOWED_FREQUENCIES = [
  { uuid: '160862OFAAAAAAAAAAAAAAA', display: 'Uma vez por dia', timesPerDay: 1 },
  { uuid: '160858OFAAAAAAAAAAAAAAA', display: 'Duas vezes por dia', timesPerDay: 2 },
  { uuid: '160866OFAAAAAAAAAAAAAAA', display: 'Três vezes por dia', timesPerDay: 3 },
  { uuid: '160870OFAAAAAAAAAAAAAAA', display: 'Quatro vezes por dia', timesPerDay: 4 },
];

export const DISPENSE_TYPES: DispenseType[] = [
  { uuid: 'ff8081817cbbce66017cbbf78a8c0006', code: 'DM', display: 'Dispensa Mensal' },
  { uuid: 'ff8081817cbbce66017cbbf78a8c0066', code: 'DB', display: 'Dispensa Bimensal' },
  { uuid: 'ff8081817cbbce66017cbbf7ca4e0007', code: 'DT', display: 'Dispensa Trimestral' },
  { uuid: 'ff8081817cbbce66017cbbf8044f0008', code: 'DS', display: 'Dispensa Semestral' },
  { uuid: 'ff8081817cbbce66017cbbf823190004', code: 'DN', display: 'Dispensa Semanal' },
  { uuid: 'ff8081817cbbce66017cbbf823190005', code: 'FRM', display: 'Fluxo Rápido Mensal' },
  { uuid: 'ff8081817cbbce66017cbbf823190009', code: 'DA', display: 'Dispensa Anual' },
];

// Duration units for medication
export interface AllowedDurationUnitType {
  uuid: string;
  display: string;
  duration: number;
  mapsTo: {
    uuid: string;
    duration: number;
  };
  allowedDispenseTypes?: string[];
}

export const ALLOWED_DURATIONS: AllowedDurationUnitType[] = [
  {
    uuid: 'ff8081817cbbce66017cbbcecfe30000',
    display: 'Uma Semana',
    duration: 1,
    mapsTo: { uuid: '1072AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', duration: 1 },
    allowedDispenseTypes: ['ff8081817cbbce66017cbbf823190004'],
  },
  {
    uuid: 'ff8081817cbbce66017cbbcf41280001',
    display: 'Duas Semanas',
    duration: 2,
    mapsTo: { uuid: '1072AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', duration: 2 },
    allowedDispenseTypes: ['ff8081817cbbce66017cbbf823190004'],
  },
  {
    uuid: 'ff8081817cbbce66017cbbcf9a550002',
    display: 'Um Mês',
    duration: 4,
    mapsTo: { uuid: '1074AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', duration: 1 },
    allowedDispenseTypes: ['ff8081817cbbce66017cbbf78a8c0006'],
  },
  {
    uuid: 'ff8081817cbbce66017cbbd02e620003',
    display: 'Dois Meses',
    duration: 8,
    mapsTo: { uuid: '1074AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', duration: 12 },
    allowedDispenseTypes: [
      'ff8081817cbbce66017cbbf78a8c0006',
      'ff8081817cbbce66017cbbf78a8c0066',
      'ff8081817cbbce66017cbbf823190004',
    ],
  },
  {
    uuid: 'ff8081817cbbce66017cbbd079e20004',
    display: 'Três Meses',
    duration: 12,
    mapsTo: { uuid: '1074AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', duration: 3 },
    allowedDispenseTypes: ['ff8081817cbbce66017cbbf78a8c0006', 'ff8081817cbbce66017cbbf7ca4e0007'],
  },
  {
    uuid: 'ff8081817cbbce66017cbbd136bf0005',
    display: 'Seis Meses',
    duration: 24,
    mapsTo: { uuid: '1074AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', duration: 6 },
    allowedDispenseTypes: [
      'ff8081817cbbce66017cbbf78a8c0006',
      'ff8081817cbbce66017cbbf7ca4e0007',
      'ff8081817cbbce66017cbbf8044f0008',
      'ff8081817cbbce66017cbbf78a8c0066',
      'ff8081817cbbce66017cbbf823190004',
    ],
  },
];

// Clinical services
export interface ClinicalService {
  uuid: string;
  display: string;
}

export const CLINICAL_SERVICES: ClinicalService[] = [
  { uuid: 'C2AE49AE-FD70-4E6C-8C96-9131B62ECEDF', display: 'PPE' },
  { uuid: 'C4A3FFFA-BA52-4BEF-948D-1C8C90C3F38E', display: 'CCR' },
  { uuid: '80A7852B-57DF-4E40-90EC-ABDE8403E01F', display: 'TARV' },
  { uuid: '6D12193B-7D5D-4665-8FC6-A03855986FBD', display: 'TPT' },
  { uuid: '165C876C-F850-436F-B0BB-80D519056BC3', display: 'PREP' },
  { uuid: 'F5FEAD76-3038-4D3D-AC28-D63B9952F022', display: 'TB' },
];

// Dispense types
export interface DispenseType {
  uuid: string;
  code: string;
  display: string;
}

// Concept UUIDs
export const CONCEPT_UUIDS = {
  REGIMEN: 'e1d83e4e-1d5f-11e0-b929-000c29ad1d07',
  THERAPEUTIC_LINE: 'fdff0637-b36f-4dce-90c7-fe9f1ec586f0',
  CHANGE_LINE: 'e1d9f252-1d5f-11e0-b929-000c29ad1d07',
  LINE_CHANGE_JUSTIFICATION: 'e1de8862-1d5f-11e0-b929-000c29ad1d07',
  AMOUNT_PER_TIME: '16cbff04-b3fc-4eae-8b7a-9b8b974fb211',
  YES: '1065AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  NO: '1066AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  TABLET_DOSE_UNIT: '1513AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  ORAL_ROUTE: '160240AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
};

// API paths
export const API_PATHS = {
  PRESCRIPTION: '/ws/rest/v1/csaudecore/prescription',
  ENCOUNTER: '/ws/rest/v1/encounter',
  PATIENT: '/ws/rest/v1/patient',
};

// Default UUIDs
export const DEFAULT_UUIDS = {
  PROVIDER: 'a42d90ef-1587-460a-98db-f82f43cddc0f',
  LOCATION: 'f03ff5ac-eef2-4586-a73f-7967e38ed8ee',
  DEFAULT_LINE: 'a6bbe1ac-5243-40e4-98cb-7d4a1467dfbe',
  ENCOUNTER_TYPE: 'e2791f26-1d5f-11e0-b929-000c29ad1d07',
  CLINICIAN_ROLE: '240b26f9-dd88-4172-823d-4a8bfeb7841f',
  CARE_SETTING: '6f0c9a92-6f24-11e3-af88-005056821db0', // Outpatient
};

// Therapeutic lines
export interface TherapeuticLine {
  sourceId: string;
  sourceUuid: string;
  sourceDisplay: string;
  openMrsUuid: string;
}

export const THERAPEUTIC_LINES: TherapeuticLine[] = [
  {
    sourceId: 'ff8081817cb69063017cbbaea6f30009',
    sourceDisplay: '1',
    sourceUuid: '7323b36e-fedf-45bc-b866-083854c09f7b',
    openMrsUuid: 'a6bbe1ac-5243-40e4-98cb-7d4a1467dfbe',
  },
  {
    sourceId: 'ff8081817cb69063017cbbagb014av0c',
    sourceDisplay: '1_ALT',
    sourceUuid: '6E117555-BB10-43C9-83B4-9171A1734BB7',
    openMrsUuid: null,
  },
  {
    sourceId: 'ff8081817cb69063017cbbaeef36000a',
    sourceDisplay: '2',
    sourceUuid: '8112b34d-6695-48b2-975a-7fd7abb06a6e',
    openMrsUuid: '7f367983-9911-4f8c-bbfc-a85678801f64',
  },
  {
    sourceId: 'ff8081817cb69063017cbbaf1701000b',
    sourceDisplay: '3',
    sourceUuid: '843c7cff-f2ba-4134-a015-43370c614de6',
    openMrsUuid: 'ade7656f-0ce3-461b-b7d8-121932dcd6a2',
  },
];

export const CARE_SETTING = '6f0c9a92-6f24-11e3-af88-005056821db0'; // Outpatient
