import { type DataSource } from '@csaude/esm-form-engine-lib';
import { type OpenmrsResource } from '@openmrs/esm-framework';

const DrugFormulationDatasource: DataSource<OpenmrsResource> = {
  fetchData: async (): Promise<OpenmrsResource[]> => {
    return Promise.resolve([{ uuid: '', display: 'Test' }]);
  },
  fetchSingleItem: function (): Promise<OpenmrsResource> {
    throw new Error('Function not implemented.');
  },
  toUuidAndDisplay: function (): OpenmrsResource {
    throw new Error('Function not implemented.');
  },
};
export default DrugFormulationDatasource;
