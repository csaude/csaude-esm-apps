import React from 'react';
import { useTranslation } from 'react-i18next';
import { FormGroup, RadioButtonGroup, RadioButton, Select, SelectItem } from '@carbon/react';
import { FormErrorDisplay } from '../components';
import { Justification } from '../hooks/types';

interface JustificationSectionProps {
  changeLine: string;
  handleChangeLineChange: (value: string) => void;
  justifications: Array<Justification>;
  selectedJustification: Justification | null;
  justificationError: string | null;
  isLoadingJustifications: boolean;
  handleJustificationChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const JustificationSection: React.FC<JustificationSectionProps> = ({
  changeLine,
  handleChangeLineChange,
  justifications,
  selectedJustification,
  justificationError,
  isLoadingJustifications,
  handleJustificationChange,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <FormGroup legendText={t('changeLine', 'Alterar Linha Terapêutica')}>
        <RadioButtonGroup
          name="change-line"
          orientation="horizontal"
          valueSelected={changeLine}
          onChange={handleChangeLineChange}>
          <RadioButton id="change-line-yes" labelText={t('yes', 'Sim')} value="true" />
          <RadioButton id="change-line-no" labelText={t('no', 'Não')} value="false" />
        </RadioButtonGroup>
      </FormGroup>

      {changeLine === 'true' && (
        <div>
          <FormGroup legendText={t('changeLineJustification', 'Motivo da alteração da linha')}>
            <Select
              id="justification-select"
              labelText=""
              value={selectedJustification?.uuid || ''}
              onChange={handleJustificationChange}
              disabled={isLoadingJustifications}>
              <SelectItem
                text={
                  isLoadingJustifications ? t('loading', 'Loading...') : t('selectJustification', 'Selecione o motivo')
                }
                value=""
              />
              {justifications.map((justification) => (
                <SelectItem key={justification.uuid} text={justification.display} value={justification.uuid} />
              ))}
            </Select>
          </FormGroup>
          <FormErrorDisplay error={justificationError} title={t('justificationError', 'Erro no Motivo')} />
        </div>
      )}
    </>
  );
};

export default JustificationSection;
