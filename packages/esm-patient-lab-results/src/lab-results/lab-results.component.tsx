import React, { useEffect, useState } from 'react';
import { CheckboxGroup, Checkbox } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import styles from './lab-results.scss';
import ViralLoad from './viral-load.component';
import Cd4Absolute from './cd4-absolute.component';
import Genexpert from './genexpert.component';
import TbLam from './tb-lam.component';

interface Props {
  patient: {
    id: string;
  };
}

const LabResults: React.FC<Props> = ({ patient }) => {
  const { t } = useTranslation();
  const [labResults, setLabResults] = useState([
    {
      name: t('viralLoad', 'Carga Viral'),
      hash: 'viral-load',
      component: <ViralLoad patient={patient} />,
      isChecked: false,
    },
    {
      name: t('Cd4Absolute', 'CD4 Absoluto'),
      hash: 'cd4-absolute',
      component: <Cd4Absolute patient={patient} />,
      isChecked: false,
    },
    {
      name: t('genexpert', 'Genexpert'),
      hash: 'genexpert',
      component: <Genexpert patient={patient} />,
      isChecked: false,
    },
    {
      name: t('tbLam', 'TB LAM'),
      hash: 'tb-lam',
      component: <TbLam patient={patient} />,
      isChecked: false,
    },
  ]);

  useEffect(() => {
    const hashValue = window.location.hash.slice(1).split('#').filter(Boolean);
    if (hashValue.length) {
      hashValue.forEach((hash) => handleCheckboxChange(hash, true));
    }
  }, []);

  const handleCheckboxChange = (hash: string, checked: boolean) => {
    setLabResults((prevLabResults) =>
      prevLabResults.map((labResult) => (labResult.hash === hash ? { ...labResult, isChecked: checked } : labResult)),
    );
  };

  return (
    <div className={styles.gridContainer}>
      <div>
        <div className={styles.marginBottom}>
          <h5>{t('tests', 'Testes')}</h5>
        </div>
        <div>
          <CheckboxGroup>
            {labResults.map((labResult) => (
              <Checkbox
                key={labResult.hash}
                labelText={labResult.name}
                id={labResult.hash}
                checked={labResult.isChecked}
                onChange={(_, { checked }) => handleCheckboxChange(labResult.hash, checked)}
              />
            ))}
          </CheckboxGroup>
        </div>
      </div>
      <div>
        <div className={styles.marginBottom}>
          <h5>{t('results', 'Resultados')}</h5>
        </div>
        <div>
          {labResults.some((labResult) => labResult.isChecked)
            ? labResults
                .filter((labResult) => labResult.isChecked)
                .map((labResult) => (
                  <div className={styles.marginBottom} key={labResult.hash}>
                    {labResult.component}
                  </div>
                ))
            : labResults.map((labResult) => (
                <div className={styles.marginBottom} key={labResult.hash}>
                  {labResult.component}
                </div>
              ))}
        </div>
      </div>
    </div>
  );
};

export default LabResults;
