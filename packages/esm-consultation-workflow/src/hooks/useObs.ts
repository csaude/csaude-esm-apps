import { Obs, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';

type Link = {
  rel: string;
  uri: string;
  resourceAlias: string;
};

type ConceptName = {
  display: string;
  uuid: string;
  name: string;
  locale: string;
  localePreferred: boolean;
  conceptNameType: string;
  links: Link[];
  resourceVersion: string;
};

type ConceptSubResource = {
  uuid: string;
  display: string;
  links: Link[];
};

type Concept = {
  uuid: string;
  display: string;
  name: ConceptName;
  datatype: ConceptSubResource;
  conceptClass: ConceptSubResource;
  set: boolean;
  version: string | null;
  retired: boolean;
  names: {
    uuid: string;
    display: string;
    links: Link[];
  }[];
  descriptions: any[];
  mappings: {
    uuid: string;
    display: string;
    links: Link[];
  }[];
  answers: any[];
  setMembers: any[];
  attributes: any[];
  links: Link[];
  resourceVersion: string;
};

type Observation = {
  uuid: string;
  display: string;
  concept: ConceptSubResource;
  person: {
    uuid: string;
    display: string;
    links: Link[];
  };
  obsDatetime: string;
  accessionNumber: null;
  obsGroup: null;
  valueCodedName: null;
  groupMembers: null;
  comment: string;
  location: {
    uuid: string;
    display: string;
    links: Link[];
  };
  order: null;
  encounter: {
    uuid: string;
    display: string;
    links: Link[];
  };
  voided: boolean;
  value: Concept;
  valueModifier: null;
  formFieldPath: null;
  formFieldNamespace: null;
  status: string;
  interpretation: null;
  links: Link[];
  resourceVersion: string;
};

export function useObs(obsUuid: string) {
  const url = `${restBaseUrl}/obs/${obsUuid}`;
  const { data, error, mutate } = useSWR<{ data: Observation }, Error>(url, openmrsFetch);

  return {
    obs: data?.data,
    error: error,
    isLoading: (!data && !error) || false,
    mutate,
  };
}
