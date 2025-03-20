import React, { useCallback, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  Column,
  CopyButton,
  FileUploader,
  Grid,
  IconButton,
  InlineLoading,
  InlineNotification,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from '@carbon/react';
import { ArrowLeft, Maximize, Minimize, Download } from '@carbon/react/icons';
import { useParams } from 'react-router-dom';
import { type TFunction, useTranslation } from 'react-i18next';
import { ConfigurableLink } from '@openmrs/esm-framework';
import ActionButtons from '../action-buttons/action-buttons.component';
import AuditDetails from '../audit-details/audit-details.component';
import FormRenderer from '../form-renderer/form-renderer.component';
import Header from '../header/header.component';
import InteractiveBuilder from '../interactive-builder/interactive-builder.component';
import SchemaEditor from '../schema-editor/schema-editor.component';
import { useClobdata } from '../../hooks/useClobdata';
import type { IMarker } from 'react-ace';
import type { Criteria, Schema } from '../../types';
import styles from './form-editor.scss';
import { useConsultationWorkflow } from '../../hooks/useConsultationWorkflow';
import EligibilityCriteria from '../eligibility-criteria/eligibility-criteria.component';

interface ErrorProps {
  error: Error;
  title: string;
}

interface TranslationFnProps {
  t: TFunction;
}

interface MarkerProps extends IMarker {
  text: string;
}

type Status = 'idle' | 'formLoaded' | 'schemaLoaded';

const ErrorNotification = ({ error, title }: ErrorProps) => {
  return (
    <InlineNotification
      className={styles.errorNotification}
      kind={'error'}
      lowContrast
      subtitle={error?.message}
      title={title}
    />
  );
};

const FormEditorContent: React.FC<TranslationFnProps> = ({ t }) => {
  const defaultEnterDelayInMs = 300;
  const { formUuid } = useParams<{ formUuid: string }>();
  const isNewSchema = !formUuid;
  const [schema, setSchema] = useState<Schema>();
  const { consultationWorkflow, consultationWorkflowError, isLoadingConsultationWorkflow } =
    useConsultationWorkflow(formUuid);
  const { clobdata, clobdataError, isLoadingClobdata } = useClobdata(consultationWorkflow);
  const [status, setStatus] = useState<Status>('idle');
  const [isMaximized, setIsMaximized] = useState(false);
  const [stringifiedSchema, setStringifiedSchema] = useState(schema ? JSON.stringify(schema, null, 2) : '');
  const [validationResponse, setValidationResponse] = useState([]);
  const [errors, setErrors] = useState<Array<MarkerProps>>([]);
  const [validationOn, setValidationOn] = useState(false);
  const [invalidJsonErrorMessage, setInvalidJsonErrorMessage] = useState('');
  const [criteria, setCriteria] = useState<Criteria[]>([]);

  const isLoadingFormOrSchema = Boolean(formUuid) && (isLoadingClobdata || isLoadingConsultationWorkflow);

  const resetErrorMessage = useCallback(() => {
    setInvalidJsonErrorMessage('');
  }, []);

  const handleSchemaChange = useCallback(
    (updatedSchema: string) => {
      resetErrorMessage();
      setStringifiedSchema(updatedSchema);
    },
    [resetErrorMessage],
  );

  useEffect(() => {
    if (consultationWorkflow) {
      setCriteria(consultationWorkflow?.criteria);
    }
  }, [consultationWorkflow]);

  useEffect(() => {
    if (formUuid) {
      if (consultationWorkflow && Object.keys(consultationWorkflow).length > 0) {
        setStatus('formLoaded');
      }

      if (status === 'formLoaded' && !isLoadingClobdata && clobdata === undefined) {
        setSchema({
          name: consultationWorkflow.name,
          steps: [],
        });
      }

      if (clobdata && Object.keys(clobdata).length > 0) {
        setStatus('schemaLoaded');
        setSchema(clobdata);
        localStorage.setItem('formJSON', JSON.stringify(clobdata));
      }
    }
  }, [clobdata, consultationWorkflow, formUuid, isLoadingClobdata, isLoadingFormOrSchema, status]);

  useEffect(() => {
    setStringifiedSchema(JSON.stringify(schema, null, 2));
  }, [schema]);

  const updateSchema = useCallback((updatedSchema: Schema) => {
    setSchema(updatedSchema);
    localStorage.setItem('formJSON', JSON.stringify(updatedSchema));
  }, []);

  const inputDummySchema = useCallback(() => {
    const dummySchema: Schema = {
      name: 'Sample Wizad Flow',
      steps: [
        {
          id: 'step-0',
          title: 'Step 1',
          renderType: 'medications',
          skippable: true,
        },
        {
          id: 'step-1',
          title: 'Step 2',
          renderType: 'orders',
          skippable: true,
        },
      ],
    };

    setStringifiedSchema(JSON.stringify(dummySchema, null, 2));
    updateSchema({ ...dummySchema });
  }, [updateSchema]);

  const renderSchemaChanges = useCallback(() => {
    resetErrorMessage();
    {
      try {
        const parsedJson: Schema = JSON.parse(stringifiedSchema);
        updateSchema(parsedJson);
        setStringifiedSchema(JSON.stringify(parsedJson, null, 2));
      } catch (e) {
        if (e instanceof Error) {
          setInvalidJsonErrorMessage(e.message);
        }
      }
    }
  }, [stringifiedSchema, updateSchema, resetErrorMessage]);

  const handleRenderSchemaChanges = useCallback(() => {
    if (errors.length) {
      setValidationOn(true);
      return;
    } else if (errors.length) {
      setValidationOn(true);
      renderSchemaChanges();
    } else {
      renderSchemaChanges();
    }
  }, [errors.length, renderSchemaChanges]);

  const handleSchemaImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        const fileContent: string = result;
        const parsedJson: Schema = JSON.parse(fileContent);
        setSchema(parsedJson);
      } else if (result instanceof ArrayBuffer) {
        const decoder = new TextDecoder();
        const fileContent: string = decoder.decode(result);
        const parsedJson: Schema = JSON.parse(fileContent);
        setSchema(parsedJson);
      }
    };

    reader.readAsText(file);
  };

  const downloadableSchema = useMemo(
    () =>
      new Blob([JSON.stringify(schema, null, 2)], {
        type: 'application/json',
      }),
    [schema],
  );

  const handleCopySchema = useCallback(async () => {
    await navigator.clipboard.writeText(stringifiedSchema);
  }, [stringifiedSchema]);

  const handleToggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  const responsiveSize = isMaximized ? 16 : 8;

  return (
    <div className={styles.container}>
      <Grid
        className={classNames(styles.grid as string, {
          [styles.maximized]: isMaximized,
        })}>
        <Column lg={responsiveSize} md={responsiveSize} className={styles.column}>
          <div className={styles.actionButtons}>
            {isLoadingFormOrSchema ? (
              <InlineLoading description={t('loadingSchema', 'Loading schema') + '...'} />
            ) : (
              <h1 className={styles.formName}>{consultationWorkflow?.name}</h1>
            )}
          </div>
          <div>
            <div className={styles.heading}>
              <span className={styles.tabHeading}>{t('schemaEditor', 'Schema editor')}</span>
              <div className={styles.topBtns}>
                {!schema ? (
                  <FileUploader
                    onChange={handleSchemaImport}
                    labelTitle=""
                    labelDescription=""
                    buttonLabel={t('importSchema', 'Import schema')}
                    buttonKind="ghost"
                    size="lg"
                    filenameStatus="edit"
                    accept={['.json']}
                    multiple={false}
                    disabled={false}
                    iconDescription={t('importSchema', 'Import schema')}
                    name="step-import"
                  />
                ) : null}
                {isNewSchema && !schema ? (
                  <Button kind="ghost" onClick={inputDummySchema}>
                    {t('inputDummySchema', 'Input dummy schema')}
                  </Button>
                ) : null}
                <Button kind="ghost" onClick={handleRenderSchemaChanges} disabled={invalidJsonErrorMessage}>
                  <span>{t('renderChanges', 'Render changes')}</span>
                </Button>
              </div>
              {schema ? (
                <>
                  <IconButton
                    enterDelayInMs={defaultEnterDelayInMs}
                    kind="ghost"
                    label={
                      isMaximized ? t('minimizeEditor', 'Minimize editor') : t('maximizeEditor', 'Maximize editor')
                    }
                    onClick={handleToggleMaximize}
                    size="md">
                    {isMaximized ? <Minimize /> : <Maximize />}
                  </IconButton>
                  <CopyButton
                    align="top"
                    className="cds--btn--md"
                    enterDelayInMs={defaultEnterDelayInMs}
                    iconDescription={t('copySchema', 'Copy schema')}
                    kind="ghost"
                    onClick={handleCopySchema}
                  />
                  <a
                    download={`${consultationWorkflow?.name}.json`}
                    href={window.URL.createObjectURL(downloadableSchema)}>
                    <IconButton
                      enterDelayInMs={defaultEnterDelayInMs}
                      kind="ghost"
                      label={t('downloadSchema', 'Download schema')}
                      size="md">
                      <Download />
                    </IconButton>
                  </a>
                </>
              ) : null}
            </div>
            {consultationWorkflowError ? (
              <ErrorNotification
                error={consultationWorkflowError}
                title={t('formError', 'Error loading form metadata')}
              />
            ) : null}
            {clobdataError ? (
              <ErrorNotification error={clobdataError} title={t('schemaLoadError', 'Error loading schema')} />
            ) : null}
            <div className={styles.editorContainer}>
              <SchemaEditor
                errors={errors}
                isLoading={isLoadingFormOrSchema}
                onSchemaChange={handleSchemaChange}
                setErrors={setErrors}
                setValidationOn={setValidationOn}
                stringifiedSchema={stringifiedSchema}
                validationOn={validationOn}
              />
            </div>
          </div>
        </Column>
        <Column lg={8} md={8} className={styles.column}>
          <ActionButtons schema={schema} t={t} schemaErrors={errors} criteria={criteria} />
          <Tabs>
            <TabList aria-label="Form previews">
              <Tab>{t('preview', 'Preview')}</Tab>
              <Tab>{t('interactiveBuilder', 'Interactive Builder')}</Tab>
              <Tab>{t('eligibilityCriteria', 'Criterios de elegibilidade')}</Tab>
              {consultationWorkflow && <Tab>{t('auditDetails', 'Audit Details')}</Tab>}
            </TabList>
            <TabPanels>
              <TabPanel>
                <FormRenderer schema={schema} isLoading={isLoadingFormOrSchema} />
              </TabPanel>
              <TabPanel>
                <InteractiveBuilder
                  schema={schema}
                  onSchemaChange={updateSchema}
                  isLoading={isLoadingFormOrSchema}
                  validationResponse={validationResponse}
                  criteria={criteria}
                />
              </TabPanel>
              <TabPanel>
                <EligibilityCriteria criteria={criteria} setCriteria={setCriteria} />
              </TabPanel>
              <TabPanel>
                {consultationWorkflow && <AuditDetails form={consultationWorkflow} key={consultationWorkflow.uuid} />}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Column>
      </Grid>
    </div>
  );
};

function BackButton({ t }: TranslationFnProps) {
  return (
    <div className={styles.backButton}>
      <ConfigurableLink to={window.getOpenmrsSpaBase() + 'wizard-workflow-builder'}>
        <Button
          kind="ghost"
          renderIcon={(props) => <ArrowLeft size={24} {...props} />}
          iconDescription="Return to dashboard">
          <span>{t('backToDashboard', 'Back to dashboard')}</span>
        </Button>
      </ConfigurableLink>
    </div>
  );
}

function FormEditor() {
  const { t } = useTranslation();

  return (
    <>
      <Header title={t('schemaEditor', 'Schema editor')} />
      <BackButton t={t} />
      <FormEditorContent t={t} />
    </>
  );
}

export default FormEditor;
