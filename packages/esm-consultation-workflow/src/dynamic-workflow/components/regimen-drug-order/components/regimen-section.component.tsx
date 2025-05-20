import React from 'react';
import { useTranslation } from 'react-i18next';
import { FormGroup, Select, SelectItem } from '@carbon/react';
import { FormErrorDisplay } from '../components';
import type { Regimen } from '../hooks/types';

interface RegimenSectionProps {
  regimens: Array<Regimen>;
  selectedRegimen: Regimen | null;
  regimenError: string | null;
  isLoadingRegimens: boolean;
  handleRegimenChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const RegimenSection: React.FC<RegimenSectionProps> = ({
  regimens,
  selectedRegimen,
  regimenError,
  isLoadingRegimens,
  handleRegimenChange,
}) => {
  const { t } = useTranslation();

  return (
    <div>
      <FormGroup legendText={t('regimenTarv', 'Regime TARV')}>
        <Select
          data-testid="regimen-select"
          labelText=""
          value={selectedRegimen?.uuid || ''}
          onChange={handleRegimenChange}
          disabled={isLoadingRegimens}>
          <SelectItem
            text={isLoadingRegimens ? t('loading', 'Loading...') : t('selectRegimen', 'Selecione o regime')}
            value=""
          />
          {regimens.map((regimen) => (
            <SelectItem key={regimen.uuid} text={regimen.display} value={regimen.uuid} />
          ))}
        </Select>
      </FormGroup>
      <FormErrorDisplay error={regimenError} title={t('regimenError', 'Erro no Regime')} />
    </div>
  );
};

export default RegimenSection;
