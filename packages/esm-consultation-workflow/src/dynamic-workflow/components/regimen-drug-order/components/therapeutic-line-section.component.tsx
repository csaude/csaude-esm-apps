import React from 'react';
import { useTranslation } from 'react-i18next';
import { FormGroup, Select, SelectItem } from '@carbon/react';
import { FormErrorDisplay } from '../components';
import { TherapeuticLine } from '../hooks/types';

interface TherapeuticLineSectionProps {
  lines: Array<TherapeuticLine>;
  selectedLine: TherapeuticLine | null;
  lineError: string | null;
  isLoadingLines: boolean;
  handleLineChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  selectedRegimen: any;
  changeLine: string;
}

const TherapeuticLineSection: React.FC<TherapeuticLineSectionProps> = ({
  lines,
  selectedLine,
  lineError,
  isLoadingLines,
  handleLineChange,
  selectedRegimen,
  changeLine,
}) => {
  const { t } = useTranslation();

  return (
    <div>
      <FormGroup legendText={t('therapeuticLine', 'Linha Terapêutica')}>
        <Select
          id="line-select"
          labelText=""
          value={selectedLine?.uuid || ''}
          onChange={handleLineChange}
          disabled={isLoadingLines || !selectedRegimen || changeLine !== 'true'}>
          <SelectItem
            text={isLoadingLines ? t('loading', 'Loading...') : t('selectLine', 'Selecione a linha')}
            value=""
          />
          {lines.map((line) => (
            <SelectItem key={line.uuid} text={line.display} value={line.uuid} />
          ))}
        </Select>
      </FormGroup>
      <FormErrorDisplay error={lineError} title={t('lineError', 'Erro na Linha Terapêutica')} />
    </div>
  );
};

export default TherapeuticLineSection;
