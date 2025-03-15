import React, { useState } from 'react';
import { Add, TrashCan } from '@carbon/react/icons';
import styles from './query-builder.scss';
import { Criteria, CriteriaType } from '../../types';
import { useTranslation } from 'react-i18next';
import { QueryBuilderConfig } from './query-builder.resource';
import QueryBuilderInputs from './query-builder-inpus.component';
import { Button, FormGroup, Stack, Tile, Select, SelectItem } from '@carbon/react';

interface Props {
  criterias: Criteria[];
  setCriterias: React.Dispatch<React.SetStateAction<Criteria[]>>;
}

interface QueryBuilderCriteriasProps {
  type: string;
}

const QueryBuilder = ({ criterias, setCriterias }: Props) => {
  const { t } = useTranslation();

  const handleAddCriteria = () => {
    setCriterias([...criterias, { type: 'demographics', criteria: { value: '' } }]);
  };

  const handleRemoveCriteria = (index: number) => {
    const newCriterias = criterias.filter((_, i) => i !== index);
    setCriterias(newCriterias);
  };

  const handleCriteriaTypeChange = (index: number, value: CriteriaType) => {
    const newCriterias = [...criterias];
    newCriterias[index].type = value;
    setCriterias(newCriterias);
  };

  return (
    <Tile>
      <Stack gap={5}>
        <h6>Criterios de elegibilidade</h6>
        {criterias.map((criteria, index) => (
          <FormGroup legendText={''} key={criteria.type + index}>
            <div className={styles.queryBuilderFormGrid}>
              <Select
                id={`criteriaType-${index}`}
                labelText={t('criteriaType', 'Criteria Type')}
                onChange={(e) => handleCriteriaTypeChange(index, e.target.value)}>
                {QueryBuilderConfig.map((criteriaOption) => (
                  <SelectItem key={criteriaOption.type} value={criteriaOption.type} text={criteriaOption.text} />
                ))}
              </Select>
              <QueryBuilderCriterias type={criteria.type} />
              <Button
                hasIconOnly
                renderIcon={TrashCan}
                kind="danger"
                iconDescription="remover"
                onClick={() => handleRemoveCriteria(index)}
              />
            </div>
          </FormGroup>
        ))}
        <FormGroup legendText={''}>
          <Button renderIcon={Add} iconDescription="adicionar" onClick={handleAddCriteria}>
            {t('add-criteria', 'Adicionar criterio')}
          </Button>
        </FormGroup>
      </Stack>
    </Tile>
  );
};

const QueryBuilderCriterias = ({ type }: QueryBuilderCriteriasProps) => {
  const config = QueryBuilderConfig.find((c) => c.type === type)?.criterias || [];
  const { t } = useTranslation();
  const [fields, setFields] = useState(config[0].fields);

  const handleSelectChange = (e) => {
    const selectedCriteria = e.target.value;
    const selectedConfig = config.find((c) => c.name === selectedCriteria);
    if (selectedConfig) {
      setFields(selectedConfig.fields);
    }
  };

  return (
    <div className={styles.flecContainer}>
      <Select
        className={styles.flexItem}
        id={`criteria`}
        labelText={t('criteria', 'Criteria')}
        onChange={handleSelectChange}>
        {config.map((c, i) => (
          <SelectItem key={`${c.fields}-${i}`} value={c.name} text={c.name} />
        ))}
      </Select>
      {fields.map((field, i) => (
        <QueryBuilderInputs key={i} name={field.name} renderType={field.renderType} value={field.value} />
      ))}
    </div>
  );
};

export default QueryBuilder;
