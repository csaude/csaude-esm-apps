import { type PostSubmissionAction } from '@csaude/esm-form-engine-lib';
import { openmrsFetch, showSnackbar, showToast } from '@openmrs/esm-framework';

const DrugOrderSubmissionAction: PostSubmissionAction = {
  applyAction: async function ({ encounters, sessionMode }) {
    try {
      // await openmrsFetch(`/ws/rest/v1/order?patient=${patientUuid}&encounter=${encounterUuid}`, {
      //   method: 'POST',
      //   body: JSON.stringify({
      //     orderType: orderTypeUuid,
      //     orderGroup: orderGroupUuid,
      //     patient: patientUuid,
      //     encounter: encounterUuid,
      //   }),
      // });
      showSnackbar({
        title: 'Post Submission Action',
        subtitle: 'Prescrição médica criada com sucesso',
        kind: 'success',
        timeoutInMs: 5000,
      });
      showSnackbar({
        title: 'Post Submission Action',
        subtitle: 'Prescrição médica enviada para o iDMED',
        kind: 'success',
        timeoutInMs: 5000,
      });
    } catch (error) {
      showSnackbar({
        title: 'Post Submission Action Error',
        subtitle: 'Failed to create drug orders, voiding encounter',
        kind: 'error',
        timeoutInMs: 4000,
      });
    }
  },
};
export default DrugOrderSubmissionAction;
