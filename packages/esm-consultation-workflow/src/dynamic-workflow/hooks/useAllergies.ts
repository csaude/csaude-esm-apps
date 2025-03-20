import { openmrsFetch, fhirBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';

export type Allergy = {
  id: string;
  clinicalStatus: string;
  criticality: string;
  display: string;
  recordedDate: string;
  recordedBy: string;
  recorderType: string;
  note: string;
  reactionToSubstance: string;
  reactionManifestations: Array<string>;
  reactionSeverity: ReactionSeverity;
  lastUpdated: string;
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

export const useAllergies = (patientUuid: string): UseAllergies => {
  const url = `${fhirBaseUrl}/AllergyIntolerance?patient=${patientUuid}&_summary=data`;
  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data: FHIRAllergyResponse }, Error>(
    patientUuid ? url : null,
    openmrsFetch,
  );

  const formattedAllergies =
    data?.data?.total > 0
      ? data?.data.entry
          .map((entry) => entry.resource ?? [])
          .map(mapAllergyProperties)
          .sort((a, b) => (b.lastUpdated > a.lastUpdated ? 1 : -1))
      : null;

  return {
    allergies: data ? formattedAllergies : null,
    error: error,
    isLoading,
    isValidating,
    mutate,
  };
};

const mapAllergyProperties = (allergy: FHIRAllergy): Allergy => {
  const manifestations = allergy?.reaction[0]?.manifestation?.map((coding) => coding?.coding[0].display);
  return {
    id: allergy?.id,
    clinicalStatus: allergy?.clinicalStatus?.coding[0]?.display,
    criticality: allergy?.criticality,
    display: allergy?.code?.coding[0].display,
    recordedDate: allergy?.recordedDate,
    recordedBy: allergy?.recorder?.display,
    recorderType: allergy?.recorder?.type,
    note: allergy?.note?.[0]?.text,
    reactionToSubstance: allergy?.reaction[0]?.substance?.coding[0].display,
    reactionManifestations: manifestations,
    reactionSeverity: allergy?.reaction[0]?.severity,
    lastUpdated: allergy?.meta?.lastUpdated,
  };
};
