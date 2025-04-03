import { fhirBaseUrl, openmrsFetch } from '@openmrs/esm-framework';
import useSWR from 'swr';

export type Allergy = {
  uuid: string;
  clinicalStatus: string;
  criticality: string;
  display: string;
  recordedDate: string;
  recordedBy: string;
  recorderType: string;
  note: string;
  reactionToSubstance: string;
  reactions: Array<Reaction>;
  severity: {
    uuid: string;
    display: string;
  };
  lastUpdated: string;
};

type Reaction = {
  reaction: { uuid: string; display: string };
};

interface FHIRAllergyResponse {
  entry: Array<{
    resource: FHIRAllergy;
  }>;
  id: string;
  meta: {
    lastUpdated: string;
  };
  resourceType: string;
  total: number;
  type: string;
}

interface FHIRAllergy {
  resourceType: string;
  id: string;
  category: Array<string>;
  meta?: {
    lastUpdated: string;
  };
  clinicalStatus: {
    coding: Array<CodingData>;
    text: string;
  };
  code: {
    coding: Array<CodingData>;
  };
  criticality: string;
  note?: [
    {
      text: string;
    },
  ];
  patient: {
    display: string;
    identifier: {
      id: string;
      system: string;
      use: string;
      value: string;
    };
    reference: string;
    type: string;
  };
  reaction: Array<AllergicReaction>;
  recordedDate: string;
  recorder: {
    display: string;
    reference: string;
    type: string;
  };
  text: {
    div: string;
    status: string;
  };
  type: string;
}

interface CodingData {
  code: string;
  display: string;
  system?: string;
}

interface AllergicReaction {
  manifestation: Array<{
    coding: CodingData;
  }>;
  severity: ReactionSeverity;
  substance: {
    coding: Array<CodingData>;
  };
}

enum ReactionSeverity {
  MILD = 'mild',
  MODERATE = 'moderate',
  SEVERE = 'severe',
}

type UseAllergies = {
  allergies: Array<Allergy>;
  error: Error | null;
  isLoading: boolean;
  isValidating: boolean;
  mutate: () => void;
};
