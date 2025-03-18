import React, { type SyntheticEvent, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  Button,
  ComposedModal,
  Form,
  FormGroup,
  InlineLoading,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Stack,
  TextArea,
  TextInput,
} from '@carbon/react';
import { navigate, showSnackbar } from '@openmrs/esm-framework';
// import { useEncounterTypes } from '../../../../hooks/useEncounterTypes';
// import { useForm } from '../../../../hooks/useForm';
import {
  deleteClobdata,
  deleteResource,
  getResourceUuid,
  // saveNewForm,
  // updateForm,
  uploadSchema,
} from '../../../../resources/forms.resource';
import type { Criteria, EncounterType, Resource, Schema } from '../../../../types';
import styles from './save-workflow.scss';
import { useConsultationWorkflow } from '../../../../hooks/useConsultationWorkflow';
import {
  saveNewConsultationWorkflow,
  updateConsultationWorkflow,
} from '../../../../resources/consultation-workflow.resource';

interface FormGroupData {
  name: string;
  uuid: string;
  version: string;
  // encounterType: EncounterType;
  description: string;
  resourceValueReference?: string;
  // resources: Array<Resource>;
}

interface SaveWorkflowModalProps {
  consultationWorkflow: FormGroupData;
  schema: Schema;
  criteria: Criteria[];
}

const SaveWorkflowModal: React.FC<SaveWorkflowModalProps> = ({ consultationWorkflow, schema, criteria }) => {
  const { t } = useTranslation();
  // const { encounterTypes } = useEncounterTypes();
  const { formUuid } = useParams<{ formUuid: string }>();
  const { mutate } = useConsultationWorkflow(formUuid);
  const isSavingNewForm = !formUuid;
  const [description, setDescription] = useState('');
  // const [encounterType, setEncounterType] = useState('');
  const [isInvalidVersion, setIsInvalidVersion] = useState(false);
  const [isSavingForm, setIsSavingForm] = useState(false);
  const [name, setName] = useState('');
  const [openConfirmSaveModal, setOpenConfirmSaveModal] = useState(false);
  const [openSaveFormModal, setOpenSaveFormModal] = useState(false);
  const [saveState, setSaveState] = useState('');
  const [version, setVersion] = useState('');

  const clearDraftFormSchema = useCallback(() => localStorage.removeItem('formSchema'), []);

  useEffect(() => {
    if (schema) {
      setName(schema.name);
      setDescription(consultationWorkflow?.description);
      // setEncounterType(schema.encounterType);
      setVersion(consultationWorkflow?.version);
    }
  }, [schema, consultationWorkflow]);

  const checkVersionValidity = (version: string) => {
    if (!version) {
      return setIsInvalidVersion(false);
    }

    setIsInvalidVersion(!/^[0-9]/.test(version));
  };

  const openModal = useCallback((option: string) => {
    if (option === 'newVersion') {
      setSaveState('newVersion');
      setOpenConfirmSaveModal(false);
      setOpenSaveFormModal(true);
    } else if (option === 'new') {
      setSaveState('newVersion');
      setOpenSaveFormModal(true);
    } else if (option === 'update') {
      setSaveState('update');
      setOpenConfirmSaveModal(false);
      setOpenSaveFormModal(true);
    }
  }, []);

  // const handleSubmit = async (event: SyntheticEvent<{ name: { value: string } }>) => {
  //   alert('HADLE SUBMIT');
  // };

  const handleSubmit = async (event: SyntheticEvent<{ name: { value: string } }>) => {
    event.preventDefault();
    setIsSavingForm(true);

    // console.log(event);

    const target = event.target as typeof event.target & {
      name: { value: string };
      version: { value: string };
      // encounterType: { value: string };
      description: { value: string };
    };

    // console.log('target', target);

    // console.log(saveState);
    if (saveState === 'new' || saveState === 'newVersion') {
      const name = target.name.value;
      const version = target.version.value;
      const description = target.description.value;

      try {
        const NewConsultationWorkflow = await saveNewConsultationWorkflow(name, version, false, description, criteria);

        const updatedSchema = {
          ...schema,
          name: name,
          // version: version,
          // description: description,
          // encounterType: encounterType,
          // uuid: NewConsultationWorkflow.uuid,
        };

        const newValueReference = await uploadSchema(updatedSchema);
        await updateConsultationWorkflow(NewConsultationWorkflow.uuid, name, version, description, newValueReference);
        // await getResourceUuid(NewConsultationWorkflow.uuid, newValueReference.toString());

        showSnackbar({
          title: t('formCreated', 'New form created'),
          kind: 'success',
          isLowContrast: true,
          subtitle:
            name + ' ' + t('saveSuccessMessage', 'was created successfully. It is now visible on the Forms dashboard.'),
        });
        clearDraftFormSchema();
        setOpenSaveFormModal(false);
        await mutate();

        navigate({
          to: `${window.spaBase}/wizard-workflow-builder/edit/${NewConsultationWorkflow.uuid}`,
        });

        setIsSavingForm(false);
      } catch (error) {
        if (error instanceof Error) {
          showSnackbar({
            title: t('errorCreatingForm', 'Error creating form'),
            kind: 'error',
            subtitle: error?.message,
          });
        }
        setIsSavingForm(false);
      }
    } else {
      try {
        const updatedSchema = {
          ...schema,
          name: name,
          // version: version,
          // description: description,
          // encounterType: encounterType,
        };

        // console.log(schema);

        // await updateConsultationWorkflow(consultationWorkflow.uuid, name, version, description);

        if (consultationWorkflow.resourceValueReference) {
          await deleteClobdata(consultationWorkflow.resourceValueReference);
        }

        const newValueReference = await uploadSchema(updatedSchema);
        await updateConsultationWorkflow(consultationWorkflow.uuid, name, version, description, newValueReference);
        showSnackbar({
          title: t('success', 'Success!'),
          kind: 'success',
          isLowContrast: true,
          subtitle: name + ' ' + t('saveSuccess', 'was updated successfully'),
        });
        setOpenSaveFormModal(false);
        await mutate();
        setIsSavingForm(false);

        // if (form?.resources?.length !== 0) {
        //   const existingValueReferenceUuid =
        //     form?.resources?.find(({ name }) => name === 'JSON schema')?.valueReference ?? '';

        //   await deleteClobdata(existingValueReferenceUuid)
        //     .catch((error) => console.error('Unable to delete clobdata: ', error))
        //     .then(() => {
        //       const resourceUuidToDelete = form?.resources?.find(({ name }) => name === 'JSON schema')?.uuid ?? '';

        //       deleteResource(form?.uuid, resourceUuidToDelete)
        //         .then(() => {
        //           uploadSchema(updatedSchema)
        //             .then((result) => {
        //               getResourceUuid(form?.uuid, result.toString())
        //                 .then(async () => {
        //                   showSnackbar({
        //                     title: t('success', 'Success!'),
        //                     kind: 'success',
        //                     isLowContrast: true,
        //                     subtitle: form?.name + ' ' + t('saveSuccess', 'was updated successfully'),
        //                   });
        //                   setOpenSaveFormModal(false);
        //                   await mutate();

        //                   setIsSavingForm(false);
        //                 })
        //                 .catch((err) => {
        //                   console.error('Error associating form with new schema: ', err);

        //                   showSnackbar({
        //                     title: t('errorSavingForm', 'Unable to save form'),
        //                     kind: 'error',
        //                     subtitle: t(
        //                       'saveError',
        //                       'There was a problem saving your form. Try saving again. To ensure you don’t lose your changes, copy them, reload the page and then paste them back into the editor.',
        //                     ),
        //                   });
        //                 });
        //             })
        //             .catch((err) => console.error('Error uploading new schema: ', err));
        //         })
        //         .catch((error) => console.error('Unable to create new clobdata resource: ', error));
        //     });
        // }
      } catch (error) {
        if (error instanceof Error) {
          showSnackbar({
            title: t('errorUpdatingForm', 'Error updating form'),
            kind: 'error',
            subtitle: error?.message,
          });
        }

        setIsSavingForm(false);
      }
    }
  };

  return (
    <>
      {!isSavingNewForm ? (
        <ComposedModal
          open={openConfirmSaveModal}
          onClose={() => setOpenConfirmSaveModal(false)}
          preventCloseOnClickOutside>
          <ModalHeader className={styles.modalHeader} title={t('saveConfirmation', 'Save or Update form')} />
          <ModalBody>
            <p>
              {t(
                'saveAsModal',
                "A version of the form you're working on already exists on the server. Do you want to update the form or to save it as a new version?",
              )}
            </p>
          </ModalBody>
          <ModalFooter>
            <Button kind={'tertiary'} onClick={() => openModal('update')}>
              {t('updateExistingForm', 'Update existing version')}
            </Button>
            <Button kind={'primary'} onClick={() => openModal('newVersion')}>
              {t('saveAsNewForm', 'Save as a new form')}
            </Button>
            <Button kind={'secondary'} onClick={() => setOpenConfirmSaveModal(false)}>
              {t('close', 'Close')}
            </Button>
          </ModalFooter>
        </ComposedModal>
      ) : null}

      <ComposedModal open={openSaveFormModal} onClose={() => setOpenSaveFormModal(false)} preventCloseOnClickOutside>
        <ModalHeader className={styles.modalHeader} title={t('saveWorkflowToServer', 'Save workflow to server')} />
        <Form onSubmit={handleSubmit} className={styles.saveFormBody}>
          <ModalBody>
            <p>
              {t(
                'saveExplainerText',
                'Clicking the Save button saves your form schema to the database. To see your form in your frontend, you first need to publish it. Click the Publish button to publish your form.',
              )}
            </p>
            <FormGroup legendText={''}>
              <Stack gap={5}>
                <TextInput
                  id="name"
                  labelText={t('workflowName', 'Workflow Name')}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => setName(event.target.value)}
                  placeholder={t('workNamePlaceholder', 'e.g. OHRI Express Care Patient Encounter Form')}
                  required
                  value={name}
                />
                {saveState === 'update' ? (
                  <TextInput
                    id="uuid"
                    labelText={t('autogeneratedUuid', 'UUID (auto-generated)')}
                    disabled
                    value={consultationWorkflow?.uuid}
                  />
                ) : null}
                <TextInput
                  id="version"
                  labelText={t('version', 'Version')}
                  placeholder="e.g. 1.0"
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    checkVersionValidity(event.target.value);

                    if (!isInvalidVersion) {
                      setVersion(event.target.value);
                    }
                  }}
                  invalid={isInvalidVersion}
                  invalidText={t('invalidVersionWarning', 'Version can only start with with a number')}
                  required
                  value={version}
                />
                {/* <Select
                  id="encounterType"
                  labelText={t('encounterType', 'Encounter Type')}
                  onChange={(event: React.ChangeEvent<HTMLSelectElement>) => setEncounterType(event.target.value)}
                  required
                  value={encounterType}>
                  {!encounterType ? (
                    <SelectItem
                      text={t('chooseEncounterType', 'Choose an encounter type to link your form to')}
                      value=""
                    />
                  ) : null}
                  {encounterTypes?.length > 0 &&
                    encounterTypes.map((encounterType) => (
                      <SelectItem key={encounterType.uuid} value={encounterType.uuid} text={encounterType.name}>
                        {encounterType.name}
                      </SelectItem>
                    ))}
                </Select> */}
                <TextArea
                  labelText={t('description', 'Description')}
                  onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(event.target.value)}
                  id="description"
                  placeholder={t(
                    'descriptionPlaceholderText',
                    'e.g. A form used to collect encounter data for clients in the Express Care program.',
                  )}
                  required
                  value={description}
                />
              </Stack>
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            <Button kind={'secondary'} onClick={() => setOpenSaveFormModal(false)}>
              {t('close', 'Close')}
            </Button>
            <Button
              disabled={isSavingForm || isInvalidVersion}
              className={styles.spinner}
              type={'submit'}
              kind={'primary'}>
              {isSavingForm ? (
                <InlineLoading description={t('saving', 'Saving') + '...'} />
              ) : (
                <span>{t('save', 'Save')}</span>
              )}
            </Button>
          </ModalFooter>
        </Form>
      </ComposedModal>

      <Button
        disabled={!schema}
        kind="primary"
        onClick={() => (isSavingNewForm ? openModal('new') : setOpenConfirmSaveModal(true))}>
        {t('saveWorkflow', 'Save workflow')}
      </Button>
    </>
  );
};

export default SaveWorkflowModal;
