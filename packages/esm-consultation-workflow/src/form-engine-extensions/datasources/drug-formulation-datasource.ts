import { DataSource } from '@csaude/esm-form-engine-lib';
import { type OpenmrsResource } from '@openmrs/esm-framework';

const DrugFormulationDatasource: DataSource<OpenmrsResource> = {
  fetchData: async (searchTerm?: string, config?: Record<string, any>): Promise<OpenmrsResource[]> => {
    return Promise.resolve([{ uuid: '', display: 'Test' }]);
  },
  fetchSingleItem: function (uuid: string): Promise<OpenmrsResource> {
    throw new Error('Function not implemented.');
  },
  toUuidAndDisplay: function (item: OpenmrsResource): OpenmrsResource {
    throw new Error('Function not implemented.');
  },
};
export default DrugFormulationDatasource;
