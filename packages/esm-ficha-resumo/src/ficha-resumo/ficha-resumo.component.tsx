import {
  Button,
  InlineLoading,
  StructuredListBody,
  StructuredListCell,
  StructuredListHead,
  StructuredListRow,
  StructuredListWrapper,
} from '@carbon/react';
import { Edit } from '@carbon/react/icons';
import { ErrorState, formatDatetime, parseDate } from '@openmrs/esm-framework';
import { CardHeader, EmptyState, launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { fichaResumoFormWorkspace as fichaResumoWorkspace } from './constants';
import { useFichaResumo, type Concept } from './ficha-resumo.resource';
import styles from './ficha-resumo.scss';

const FichaResumo = ({ patient }: { patient: fhir.Patient }) => {
  const { fichaResumo, isLoading, error, mutate } = useFichaResumo(patient.id);
  const { t } = useTranslation();

  const headerTitle = 'Ficha Resumo';

  if (isLoading) {
    return <InlineLoading />;
  }

  if (error) {
    return <ErrorState error={error} headerTitle={headerTitle} />;
  }

  if (!fichaResumo) {
    return (
      <div className={styles.widgetCard}>
        <EmptyState
          displayText={t('fichaResumo', 'Ficha Resumo')}
          headerTitle={headerTitle}
          launchForm={() => launchPatientWorkspace(fichaResumoWorkspace, { onChange: mutate })}
        />
      </div>
    );
  }

  let preTarvText = 'N/A';
  if (fichaResumo.preTarvBookNumber) {
    preTarvText = `Nr. ${+fichaResumo.preTarvBookNumber.value}, Página ${+fichaResumo.preTarvBookPage?.value || 'N/A'}, Linha ${+fichaResumo.preTarvBookLine?.value || 'N/A'}`;
  }

  let tarvText = 'N/A';
  if (fichaResumo.tarvBookNumber) {
    tarvText = `Nr. ${+fichaResumo.tarvBookNumber.value}, Página ${+fichaResumo.tarvBookPage?.value || 'N/A'}, Linha ${+fichaResumo.tarvBookLine?.value || 'N/A'}`;
  }

  return (
    <div className={styles.widgetCard}>
      <CardHeader title={headerTitle}>
        <Button
          kind="ghost"
          renderIcon={Edit}
          iconDescription="Edit Ficha Resumo"
          onClick={() => launchPatientWorkspace(fichaResumoWorkspace, { fichaResumo, onChange: mutate })}>
          {t('edit', 'Edit')}
        </Button>
      </CardHeader>

      <div className={styles.cardBody}>
        {/* Books section */}
        <h4 className={styles.cardSectionHeader}>{t('books', 'Livros')}</h4>
        <div className={styles.cardSection}>
          <div>
            <span className={styles.label}>{t('livrosPreTarv', 'Pré-TARV')}</span>
            <div>{preTarvText}</div>
          </div>
          <div>
            <span className={styles.label}>{t('livroPreTarv', 'TARV')}</span>
            <div>{tarvText}</div>
          </div>
        </div>
        <div>
          <span className={styles.label}>{t('openingDate', 'Data de Abertura')}</span>
          <div>{formatDatetime(parseDate(fichaResumo.openingDate.value.toString()))}</div>
        </div>

        {/* Confident Section */}
        <h4 className={styles.cardSectionHeader}>{t('confidant', 'Confidente')}</h4>
        <div className={styles.cardSection}>
          <div>
            <span className={styles.label}>{t('name', 'Nome')}</span>
            <div>{fichaResumo.confidantName?.value.toString()}</div>
          </div>
          <div>
            <span className={styles.label}>{t('relationship', 'Parentesco')}</span>
            <div>{(fichaResumo.confidantRelationship?.value as Concept)?.display}</div>
          </div>
          <div>
            <span className={styles.label}>{t('phone1', 'Telefone Celular (1)')}</span>
            <div>{fichaResumo.confidantPhone1?.value.toString()}</div>
          </div>
          <div>
            <span className={styles.label}>{t('phone2', 'Telefone Celular (2)')}</span>
            <div>{fichaResumo.confidantPhone2?.value.toString()}</div>
          </div>
          <div>
            <span className={styles.label}>{t('address', 'Endereço')}</span>
            <div>{fichaResumo.confidantAddress?.value.toString()}</div>
          </div>
        </div>

        {/* Family Status Section */}
        <h4 className={styles.cardSectionHeader}>{t('familyStatus', 'Situação da família')}</h4>
        <StructuredListWrapper>
          <StructuredListHead>
            <StructuredListRow head>
              <StructuredListCell head>{t('name', 'Nome')}</StructuredListCell>
              <StructuredListCell head>{t('relationship', 'Parentesco')}</StructuredListCell>
              <StructuredListCell head>{t('age', 'Idade')}</StructuredListCell>
              <StructuredListCell head>{t('hivTest', 'Teste de HIV')}</StructuredListCell>
              <StructuredListCell head>{t('hivCare', 'Cuidados de HIV')}</StructuredListCell>
              <StructuredListCell head>{t('inCCR', 'Em CCR')}</StructuredListCell>
              <StructuredListCell head>{t('nid', 'NID')}</StructuredListCell>
            </StructuredListRow>
          </StructuredListHead>

          <StructuredListBody>
            {fichaResumo.familyStatus.map((family) => (
              <StructuredListRow>
                <StructuredListCell>{family.relativeName?.value.toString()}</StructuredListCell>
                <StructuredListCell>
                  {family.otherRelationship
                    ? '' + family.otherRelationship.value
                    : (family.relationship?.value as Concept)?.display}
                </StructuredListCell>
                <StructuredListCell>{family.age?.value.toString()}</StructuredListCell>
                <StructuredListCell>{(family.hivTest?.value as Concept)?.display}</StructuredListCell>
                <StructuredListCell>{(family.hivCare?.value as Concept)?.display}</StructuredListCell>
                <StructuredListCell>{(family.ccr?.value as Concept)?.display}</StructuredListCell>
                <StructuredListCell>{family.relativeNid?.value.toString()}</StructuredListCell>
              </StructuredListRow>
            ))}
          </StructuredListBody>
        </StructuredListWrapper>

        {/* HIV Care Section */}
        <h4 className={styles.cardSectionHeader}>{t('hivCare', 'Cuidados de HIV')}</h4>
        <div className={styles.cardSection}>
          <div>
            <span className={styles.label}>{t('hivTest', 'Teste HIV+')}</span>
            <div>{(fichaResumo.hivTestType?.value as Concept)?.display}</div>
          </div>
          <div>
            <span className={styles.label}>{t('hivTestingSite', 'Local de Testagem')}</span>
            <div>{(fichaResumo.hivTestingSite?.value as Concept)?.display}</div>
          </div>
          <div>
            <span className={styles.label}>
              {t('childPresumptiveDiagnosis', 'Diagnóstico presuntivo em crianças menores de 18 meses')}
            </span>
            <div>{(fichaResumo.childPresumptiveDiagnosis?.value as Concept)?.display}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FichaResumo;
