import React from 'react';
import { Layer, Link, Tile } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { navigate, useLayoutType } from '@openmrs/esm-framework';
import styles from './empty-state.scss';
import { EmptyDataIllustration } from './empty-data-illustration.component';

function EmptyState() {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';

  return (
    <Layer>
      <Tile className={styles.tile}>
        <div className={isTablet ? styles.tabletHeading : styles.desktopHeading}>
          <h4>{t('workflows', 'Workflows')}</h4>
        </div>
        <EmptyDataIllustration />
        <p className={styles.content}>{t('noWorkflowsToDisplay', 'There are no workflows to display.')}</p>
        <p className={styles.action}>
          <Link
            onClick={() =>
              navigate({
                to: `${window.spaBase}/wizard-workflow-builder/new`,
              })
            }>
            {t('createNewWorkflow', 'Create a new workflow')}
          </Link>
        </p>
      </Tile>
    </Layer>
  );
}

export default EmptyState;
