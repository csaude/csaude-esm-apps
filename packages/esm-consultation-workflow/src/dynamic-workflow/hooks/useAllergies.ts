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
