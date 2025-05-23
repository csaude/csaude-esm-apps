import {
  Button,
  ButtonSet,
  Checkbox,
  DatePicker,
  DatePickerInput,
  Form,
  FormGroup,
  InlineLoading,
  InlineNotification,
  Layer,
  Select,
  SelectItem,
  Stack,
  TextInput,
  TextInputSkeleton,
} from '@carbon/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { ErrorState, parseDate, showSnackbar, useLayoutType, useLocations, useSession } from '@openmrs/esm-framework';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { type TFunction, useTranslation } from 'react-i18next';
import { z } from 'zod';
import IdentifierInput from '../identifier-input.component';
import {
  createProgramEnrollment,
  findLastState,
  hasIdentifier,
  updateProgramEnrollment,
  useAvailablePrograms,
  useEnrollments,
  useExistingPatientIdentifier,
} from '../programs.resource';
import styles from './programs-form.scss';

const TRANSFER_FROM_OTHER_FACILITY = 'e1da7d3a-1d5f-11e0-b929-000c29ad1d07';

const ACTIVE_ON_PROGRAM = '4a7bec6f-8f27-4da5-b78d-40134c30d3ee';

const createProgramsFormSchema = (t: TFunction) =>
  z
    .object({
      selectedProgram: z.string().refine((value) => !!value, t('programRequired', 'Program is required')),
      enrollmentDate: z.date(),
      completionDate: z.date().nullable(),
      transferFromOtherFacility: z.boolean().nullable(),
      identifier: z.string().nullable(),
      enrollmentLocation: z.string(),
    })
    .refine(
      ({ selectedProgram, transferFromOtherFacility, identifier }) => {
        if (!selectedProgram) {
          return true;
        } else if (!hasIdentifier(selectedProgram)) {
          return true;
        } else {
          return !transferFromOtherFacility || !!identifier;
        }
      },
      { path: ['identifier'], message: 'Identifier is required' },
    );

export type ProgramsFormData = z.infer<ReturnType<typeof createProgramsFormSchema>>;

const ReceptionProgramsForm = ({ patientUuid, programEnrollmentId, onCancel, onSave, onUnsavedData }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const session = useSession();
  const availableLocations = useLocations();
  const { data: availablePrograms } = useAvailablePrograms();
  const { data: enrollments, mutateEnrollments } = useEnrollments(patientUuid);
  const programsFormSchema = useMemo(() => createProgramsFormSchema(t), [t]);

  const currentEnrollment =
    programEnrollmentId && enrollments.filter(({ patientProgram }) => patientProgram.uuid === programEnrollmentId)[0];
  const eligiblePrograms = useMemo(() => {
    const currentProgram = currentEnrollment && {
      display: currentEnrollment.patientProgram.program.name,
      ...currentEnrollment.patientProgram.program,
    };
    return currentProgram
      ? [currentProgram]
      : availablePrograms.filter((program) => {
          const enrollment = enrollments.find(({ patientProgram }) => patientProgram.program.uuid === program.uuid);
          return !enrollment || enrollment.patientProgram.dateCompleted !== null;
        });
  }, [currentEnrollment, availablePrograms, enrollments]);

  const getLocationUuid = () => {
    if (!currentEnrollment?.patientProgram.location.uuid && session?.sessionLocation?.uuid) {
      return session?.sessionLocation?.uuid;
    }
    return currentEnrollment?.patientProgram.location.uuid ?? null;
  };

  const currentState = currentEnrollment ? findLastState(currentEnrollment.patientProgram.states) : null;

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isDirty, dirtyFields, isSubmitting },
    resetField,
    setValue,
    setError,
  } = useForm<ProgramsFormData>({
    mode: 'all',
    resolver: zodResolver(programsFormSchema),
    defaultValues: {
      selectedProgram: currentEnrollment?.patientProgram.program.uuid ?? '',
      enrollmentDate: currentEnrollment?.patientProgram.dateEnrolled
        ? parseDate(currentEnrollment.patientProgram.dateEnrolled)
        : new Date(),
      completionDate: currentEnrollment?.patientProgram.dateCompleted
        ? parseDate(currentEnrollment.patientProgram.dateCompleted)
        : null,
      transferFromOtherFacility: currentState?.state.concept.uuid === TRANSFER_FROM_OTHER_FACILITY,
      identifier: currentEnrollment?.patientIdentifier ? currentEnrollment.patientIdentifier.identifier : '',
      enrollmentLocation: getLocationUuid() ?? '',
    },
  });

  const [selectedProgram, isTransferFromOtherFacility, identifierValue] = watch([
    'selectedProgram',
    'transferFromOtherFacility',
    'identifier',
  ]);

  // Load previous identifier if available
  const {
    data: existingIdentifier,
    isLoading: identifierLoading,
    error,
  } = useExistingPatientIdentifier(patientUuid, selectedProgram);
  useEffect(() => {
    if (!currentEnrollment?.patientIdentifier) {
      resetField('identifier', { defaultValue: existingIdentifier?.identifier ?? '' });
    }
  }, [currentEnrollment, existingIdentifier, resetField]);

  // Reset identifier when transfer from other facility is selected
  const autoGenerated = hasIdentifier(selectedProgram) && !isTransferFromOtherFacility;
  useEffect(() => {
    if (dirtyFields.transferFromOtherFacility) {
      setValue('identifier', '');
    } else {
      resetField('identifier');
    }
  }, [dirtyFields.transferFromOtherFacility, resetField, setValue]);

  useEffect(() => {
    onUnsavedData(() => isDirty);
  }, [isDirty, onUnsavedData]);

  const onSubmit = useCallback(
    async (data: ProgramsFormData) => {
      const {
        selectedProgram,
        enrollmentDate,
        completionDate,
        enrollmentLocation,
        transferFromOtherFacility,
        identifier,
      } = data;

      const state = eligiblePrograms
        .find((p) => p.uuid === selectedProgram)
        // Programs have only one workflow, so we get the first one
        .allWorkflows[0]?.states.find(
          (s) => s.concept.uuid === (transferFromOtherFacility ? TRANSFER_FROM_OTHER_FACILITY : ACTIVE_ON_PROGRAM),
        );

      const payload = {
        patient: patientUuid,
        program: selectedProgram,
        dateEnrolled: enrollmentDate ? dayjs(enrollmentDate).format() : null,
        dateCompleted: completionDate ? dayjs(completionDate).format() : null,
        location: enrollmentLocation,
        transferFromOtherFacility,
        identifier,
        states: !!state && state.uuid !== currentState?.state.uuid ? [{ state: { uuid: state.uuid } }] : [],
      };

      try {
        const abortController = new AbortController();

        if (currentEnrollment) {
          await updateProgramEnrollment(currentEnrollment, existingIdentifier, payload, abortController);
        } else {
          await createProgramEnrollment(payload, existingIdentifier, abortController);
        }

        await mutateEnrollments();
        onSave();

        showSnackbar({
          kind: 'success',
          title: currentEnrollment
            ? t('enrollmentUpdated', 'Program enrollment updated')
            : t('enrollmentSaved', 'Program enrollment saved'),
          subtitle: currentEnrollment
            ? t('enrollmentUpdatesNowVisible', 'Changes to the program are now visible in the Programs table')
            : t('enrollmentNowVisible', 'It is now visible in the Programs table'),
        });
      } catch (error) {
        if (!!identifierValue && error.message.includes(identifierValue)) {
          const message = error.message
            .split('reason:')[1]
            ?.replace(`${identifierValue}`, '')
            .replaceAll(/[\[\]]/g, '');
          setError('identifier', { message });
        } else {
          const message = error.message.split('reason:')[1]?.replaceAll(/[\[\]]/g, '');
          showSnackbar({
            kind: 'error',
            title: t('programEnrollmentSaveError', 'Error saving program enrollment'),
            subtitle: error instanceof Error ? message : 'An unknown error occurred',
          });
        }
      }
    },
    [
      eligiblePrograms,
      patientUuid,
      currentState?.state.uuid,
      currentEnrollment,
      mutateEnrollments,
      onSave,
      t,
      existingIdentifier,
      identifierValue,
      setError,
    ],
  );

  const programSelect = (
    <Controller
      name="selectedProgram"
      control={control}
      render={({ field: { onChange, value } }) => (
        <>
          <Select
            aria-label="program name"
            id="program"
            invalid={!!errors?.selectedProgram}
            invalidText={errors?.selectedProgram?.message}
            labelText={t('programName', 'Program name')}
            onChange={(event) => onChange(event.target.value)}
            value={value}>
            <SelectItem text={t('chooseProgram', 'Choose a program')} value="" />
            {eligiblePrograms?.length > 0 &&
              eligiblePrograms.map((program) => (
                <SelectItem key={program.uuid} text={program.display} value={program.uuid}>
                  {program.display}
                </SelectItem>
              ))}
          </Select>
        </>
      )}
    />
  );

  const enrollmentDate = (
    <Controller
      name="enrollmentDate"
      control={control}
      render={({ field: { onChange, value } }) => (
        <DatePicker
          aria-label="enrollment date"
          id="enrollmentDate"
          datePickerType="single"
          dateFormat="d/m/Y"
          maxDate={new Date().toISOString()}
          placeholder="dd/mm/yyyy"
          onChange={([date]) => onChange(date)}
          value={value}>
          <DatePickerInput id="enrollmentDateInput" labelText={t('dateEnrolled', 'Date enrolled')} />
        </DatePicker>
      )}
    />
  );

  const completionDate = (
    <Controller
      name="completionDate"
      control={control}
      render={({ field: { onChange, value } }) => (
        <DatePicker
          aria-label="completion date"
          id="completionDate"
          datePickerType="single"
          dateFormat="d/m/Y"
          minDate={new Date(watch('enrollmentDate')).toISOString()}
          maxDate={new Date().toISOString()}
          placeholder="dd/mm/yyyy"
          onChange={([date]) => onChange(date)}
          value={value}>
          <DatePickerInput id="completionDateInput" labelText={t('dateCompleted', 'Date completed')} />
        </DatePicker>
      )}
    />
  );

  // TODO handle workflows without transfer from other facility state
  const transferFromOtherFacility = (
    <Controller
      name="transferFromOtherFacility"
      control={control}
      render={({ field: { onChange, value } }) => (
        <Checkbox
          labelText={t('transferFromOther', 'Transfer from other facility')}
          id="transferFromOther"
          checked={value}
          onChange={(event) => onChange(event.target.checked)}
        />
      )}
    />
  );

  const enrollmentLocation = (
    <Controller
      name="enrollmentLocation"
      control={control}
      render={({ field: { onChange, value } }) => (
        <Select
          aria-label="enrollment location"
          id="location"
          labelText={t('enrollmentLocation', 'Enrollment location')}
          onChange={(event) => onChange(event.target.value)}
          value={value}>
          {availableLocations?.length > 0 &&
            availableLocations.map((location) => (
              <SelectItem key={location.uuid} text={location.display} value={location.uuid}>
                {location.display}
              </SelectItem>
            ))}
        </Select>
      )}
    />
  );

  let identifier = null;
  if (hasIdentifier(selectedProgram)) {
    identifier = identifierLoading ? (
      <TextInputSkeleton />
    ) : error ? (
      <ErrorState error={error} headerTitle={t('errorLoadindIdentifier', 'Error loading identifier')} />
    ) : autoGenerated ? (
      <IdentifierInput
        control={control}
        autoGenerated={autoGenerated}
        name="identifier"
        onReset={() => resetField('identifier')}
      />
    ) : (
      <Controller
        name="identifier"
        control={control}
        render={({ field: { onChange, value } }) => (
          <TextInput
            id="identifier"
            labelText={t('identifier', 'Identifier')}
            onChange={(event) => onChange(event.target.value)}
            value={value}
            invalid={!!errors?.identifier}
            invalidText={errors?.identifier?.message}
          />
        )}
      />
    );
  }

  const formGroups = [
    {
      style: { maxWidth: isTablet && '50%' },
      legendText: '',
      value: programSelect,
    },
    {
      style: { maxWidth: '50%' },
      legendText: '',
      value: enrollmentDate,
    },
    {
      style: { width: '50%' },
      legendText: '',
      value: completionDate,
    },
    {
      style: { width: '100%' },
      legendText: '',
      value: transferFromOtherFacility,
    },
    {
      style: { maxWidth: isTablet && '50%' },
      legendText: '',
      value: identifier,
    },
    {
      style: { width: '50%' },
      legendText: '',
      value: enrollmentLocation,
    },
  ];

  return (
    <Form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      <Stack className={styles.formContainer} gap={7}>
        {!availablePrograms.length && (
          <InlineNotification
            className={styles.notification}
            kind="error"
            lowContrast
            subtitle={t('configurePrograms', 'Please configure programs to continue.')}
            title={t('noProgramsConfigured', 'No programs configured')}
          />
        )}
        {formGroups
          .filter(({ value }) => !!value)
          .map((group) => (
            <FormGroup style={group.style} legendText={group.legendText} key={group.value.props?.name}>
              <div className={styles.selectContainer}>{isTablet ? <Layer>{group.value}</Layer> : group.value}</div>
            </FormGroup>
          ))}
      </Stack>
      <ButtonSet className={isTablet ? styles.tablet : styles.desktop}>
        <Button className={styles.button} kind="secondary" onClick={onCancel}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button className={styles.button} disabled={isSubmitting} kind="primary" type="submit">
          {isSubmitting ? (
            <InlineLoading description={t('saving', 'Saving') + '...'} />
          ) : (
            <span>{t('saveAndClose', 'Save and close')}</span>
          )}
        </Button>
      </ButtonSet>
    </Form>
  );
};

export default ReceptionProgramsForm;
