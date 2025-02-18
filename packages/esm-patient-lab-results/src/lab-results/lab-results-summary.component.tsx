import React, { useEffect } from 'react';
import styles from './lab-results.scss';
import { FHIREntry, useObs } from './lab-results-hooks';
import { InlineLoading, Tag } from '@carbon/react';
import { formatDatetime, parseDate } from '@openmrs/esm-framework';
import NavigationLink from './navigation-link.component';
import { useTranslation } from 'react-i18next';

interface Props {
  patientUuid: string;
  title: string;
  link: string;
  conceptUuids: string[];
}

function getLatestEffectiveDateTimeEntries(entries: FHIREntry[]): FHIREntry[] {
  const latestDate = new Date(
    Math.max(...entries.map((entry) => new Date(entry.resource.effectiveDateTime).getTime())),
  );

  return entries.filter((entry) => new Date(entry.resource.effectiveDateTime).getTime() === latestDate.getTime());
}

const LabResultsSummary: React.FC<Props> = ({ patientUuid, title, conceptUuids, link }) => {
  const [observations, setObservations] = React.useState<FHIREntry[]>();
  const conceptUuidString = conceptUuids.join(',');
  const { isLoading, error, obs } = useObs(patientUuid, conceptUuidString);
  const { t } = useTranslation();

  useEffect(() => {
    if (obs && obs.length > 0) {
      const latestEntries = getLatestEffectiveDateTimeEntries(obs);
      setObservations(latestEntries);
    }
  }, [obs]);

  if (isLoading) {
    return (
      <div className={styles.widgetNotFound}>
        <div className={styles.widgetHeader}>
          <span className={styles.title}>{title}</span>
          <InlineLoading />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.widgetNotFound}>
        <div className={styles.widgetHeader}>
          <span className={styles.title}>{title}</span>
          <Tag size="md" type="red">
            {error.message}
          </Tag>
        </div>
      </div>
    );
  }

  if (observations) {
    return (
      <div className={styles.widget}>
        <div className={styles.widgetHeader}>
          <h5 className={styles.title}>{title}</h5>
          <span className={styles.label}>{formatDatetime(parseDate(observations[0].resource.effectiveDateTime))}</span>
          <div>
            <NavigationLink className={styles.link} name={link} title={t('seeHistory', 'Ver histórico')} />
          </div>
        </div>
        <div className={styles.widgetBody}>
          {observations.map((item) => (
            <div key={item.fullUrl}>
              <div className={styles.label}>{item.resource.code.text}</div>
              <div className={styles.result}>
                {item.resource.valueQuantity && (
                  <>
                    <span>{item.resource.valueQuantity.value}</span>
                    <span>{item.resource.valueQuantity.unit}</span>
                  </>
                )}
                {item.resource.valueCodeableConcept && <span>{item.resource.valueCodeableConcept.text}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.widgetNotFound}>
      <div className={styles.widgetHeader}>
        <div className={styles.title}>{title}</div>
        <div className={styles.label}>{t('labResultNotFound', 'Nenhum dado foi registado para este utente')}</div>
      </div>
    </div>
  );
};
export default LabResultsSummary;
