import React from 'react';
import { useTranslation } from 'react-i18next';
import { StructuredListWrapper, StructuredListRow, StructuredListCell, StructuredListBody } from '@carbon/react';

interface AuditDetailsProps {
  form: FormGroupData;
}

export interface AuditInfo {
  creator: Creator;
  dateCreated: string;
  changedBy: ChangedBy;
  dateChanged: string;
}

interface Creator {
  display: string;
}

interface ChangedBy {
  uuid: string;
  display: string;
}

interface FormGroupData {
  name: string;
  uuid: string;
  version: string;
  description: string;
  published?: boolean;
}

const AuditDetails: React.FC<AuditDetailsProps> = ({ form }) => {
  const { t } = useTranslation();

  return (
    <StructuredListWrapper isCondensed selection={false}>
      <StructuredListBody>
        <StructuredListRow>
          <StructuredListCell>
            <b>{t('formName', 'Form Name')}</b>
          </StructuredListCell>
          <StructuredListCell>{form.name}</StructuredListCell>
        </StructuredListRow>
        <StructuredListRow>
          <StructuredListCell>{t('description', 'Description')}</StructuredListCell>
          <StructuredListCell>{form.description}</StructuredListCell>
        </StructuredListRow>
        <StructuredListRow>
          <StructuredListCell>{t('formUuid', 'Form UUID')}</StructuredListCell>
          <StructuredListCell>{form.uuid}</StructuredListCell>
        </StructuredListRow>
        <StructuredListRow>
          <StructuredListCell>{t('version', 'Version')}</StructuredListCell>
          <StructuredListCell>{form.version}</StructuredListCell>
        </StructuredListRow>
        <StructuredListRow>
          <StructuredListCell>{t('createdBy', 'Created By')}</StructuredListCell>
        </StructuredListRow>
        <StructuredListRow>
          <StructuredListCell>{t('lastEditedBy', 'Last Edited By')}</StructuredListCell>
        </StructuredListRow>
        <StructuredListRow>
          <StructuredListCell>{t('published', 'Published')}</StructuredListCell>
          <StructuredListCell>{form.published ? t('yes', 'Yes') : t('no', 'No')}</StructuredListCell>
        </StructuredListRow>
      </StructuredListBody>
    </StructuredListWrapper>
  );
};

export default AuditDetails;
