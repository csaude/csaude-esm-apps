import { ENCOUNTER_TYPE_TARV, ENCOUNTER_TYPE_TPT } from '../constants';

export interface RegimenTypeConfig {
  // Basic configuration
  name: string;
  encounterType: string;

  // Core concepts (required for all regimens)
  concepts: {
    regimen: string; // Required for all regimens
    // Optional concepts (TARV-specific)
    therapeuticLine?: string; // Only needed if this regimen has lines
    changeLine?: string; // Only needed if line changes are supported
    justification?: string; // Only needed if justifications are tracked,
    prophylaxisStatus?: string; // Only needed for TPT regimens
  };

  // UI section visibility control
  sections: {
    // These can be toggled depending on regimen type
    therapeuticLine: boolean; // Show therapeutic line selection (TARV-specific)
    changeLine: boolean; // Show change line option (TARV-specific)
    justification: boolean; // Show justification (TARV-specific)
    prophylaxisStatus: boolean; // Show prophylaxis status (TPT-specific)
  };
}

export const TARV_REGIMEN_CONFIG: RegimenTypeConfig = {
  name: 'TARV Regimen',
  encounterType: ENCOUNTER_TYPE_TARV,
  concepts: {
    regimen: 'e1d83d4a-1d5f-11e0-b929-000c29ad1d07',

    therapeuticLine: 'TARV Therapeutic Line Concept',
    changeLine: 'TARV Change Line Concept',
    justification: 'TARV Justification Concept',
  },
  sections: {
    therapeuticLine: true,
    changeLine: true,
    justification: true,
    prophylaxisStatus: false, // Not applicable for TARV
  },
};
export const TPT_REGIMEN_CONFIG: RegimenTypeConfig = {
  name: 'TPT Regimen',
  encounterType: ENCOUNTER_TYPE_TPT,
  concepts: {
    regimen: '9db4ce3b-4c1c-45dd-905f-c984a052f26e',
    therapeuticLine: undefined, // Not applicable for TPT
    changeLine: undefined, // Not applicable for TPT
    justification: undefined,
    prophylaxisStatus: 'b6c4d473-2af5-4c4d-a9bb-ad3779fa5579',
  },
  sections: {
    therapeuticLine: false, // Not applicable for TPT
    changeLine: false, // Not applicable for TPT
    justification: false, // Not applicable for TPT
    prophylaxisStatus: true, // Show prophylaxis status for TPT
  },
};

export const REGIMEN_CONFIGS: Record<string, RegimenTypeConfig> = {
  TARV: TARV_REGIMEN_CONFIG,
  TPT: TPT_REGIMEN_CONFIG,
};

export function getRegimenConfig(regimenType: string): RegimenTypeConfig {
  const config = REGIMEN_CONFIGS[regimenType];
  if (!config) {
    throw new Error(`Regimen configuration not found for type: ${regimenType}`);
  }
  return config;
}
