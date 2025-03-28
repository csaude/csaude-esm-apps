import {
  Button,
  ButtonSet,
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
} from '@carbon/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { parseDate, showSnackbar, useConfig, useLayoutType, useLocations, useSession } from '@openmrs/esm-framework';
import dayjs from 'dayjs';
import React, { useCallback, useEffect, useMemo } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { type TFunction, useTranslation } from 'react-i18next';
import { z } from 'zod';
import {
  createProgramEnrollment,
  findLastState,
  updateProgramEnrollment,
  useAvailablePrograms,
  useEnrollments,
} from '../programs.resource';
import styles from './programs-form.scss';

const createProgramsFormSchema = (t: TFunction) =>
  z.object({
    selectedProgram: z.string().refine((value) => !!value, t('programRequired', 'Program is required')),
    enrollmentDate: z.date(),
    completionDate: z.date().nullable(),
    enrollmentLocation: z.string(),
    selectedProgramStatus: z.string(),
  });

export type ProgramsFormData = z.infer<ReturnType<typeof createProgramsFormSchema>>;

const DefaultProgramsForm = ({ patientUuid, programEnrollmentId, onCancel, onSave, onUnsavedData }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const session = useSession();
  const availableLocations = useLocations();
  const { data: availablePrograms } = useAvailablePrograms();
  const { data: enrollments, mutateEnrollments } = useEnrollments(patientUuid);
  const { showProgramStatusField } = useConfig();

  const programsFormSchema = useMemo(() => createProgramsFormSchema(t), [t]);

  const currentEnrollment =
    programEnrollmentId && enrollments.filter(({ patientProgram }) => patientProgram.uuid === programEnrollmentId)[0];
  const currentProgram = currentEnrollment
    ? {
        display: currentEnrollment.patientProgram.program.name,
        ...currentEnrollment.patientProgram.program,
      }
    : null;

  const eligiblePrograms = currentProgram
    ? [currentProgram]
    : availablePrograms.filter((program) => {
        const enrollment = enrollments.find(({ patientProgram }) => patientProgram.program.uuid === program.uuid);
        return !enrollment || enrollment.patientProgram.dateCompleted !== null;
      });

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
    formState: { errors, isDirty, isSubmitting },
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
      enrollmentLocation: getLocationUuid() ?? '',
      selectedProgramStatus: currentState?.state.uuid ?? '',
    },
  });

  const selectedProgram = useWatch({ control, name: 'selectedProgram' });

  useEffect(() => {
    onUnsavedData(() => isDirty);
  }, [isDirty, onUnsavedData]);

  const onSubmit = useCallback(
    async (data: ProgramsFormData) => {
      const { selectedProgram, enrollmentDate, completionDate, enrollmentLocation, selectedProgramStatus } = data;

      const payload = {
        patient: patientUuid,
        program: selectedProgram,
        dateEnrolled: enrollmentDate ? dayjs(enrollmentDate).format() : null,
        dateCompleted: completionDate ? dayjs(completionDate).format() : null,
        location: enrollmentLocation,
        states:
          !!selectedProgramStatus && selectedProgramStatus != currentState?.state.uuid
            ? [{ state: { uuid: selectedProgramStatus } }]
            : [],
      };

      try {
        const abortController = new AbortController();

        if (currentEnrollment) {
          await updateProgramEnrollment(currentEnrollment, null, payload, abortController);
        } else {
          await createProgramEnrollment(payload, null, abortController);
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
        showSnackbar({
          kind: 'error',
          title: t('programEnrollmentSaveError', 'Error saving program enrollment'),
          subtitle: error instanceof Error ? error.message : 'An unknown error occurred',
        });
      }
    },
    [onSave, currentEnrollment, currentState, mutateEnrollments, patientUuid, t],
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

  let workflowStates = [];
  if (!currentProgram && !!selectedProgram) {
    const program = eligiblePrograms.find((p) => p.uuid === selectedProgram);
    if (program?.allWorkflows.length > 0) {
      workflowStates = program.allWorkflows[0].states;
    }
  } else if (currentProgram?.allWorkflows.length > 0) {
    workflowStates = currentProgram.allWorkflows[0].states;
  }

  const programStatusDropdown = (
    <Controller
      name="selectedProgramStatus"
      control={control}
      render={({ field: { onChange, value } }) => (
        <>
          <Select
            aria-label={t('programStatus', 'Program status')}
            id="programStatus"
            invalid={!!errors?.selectedProgramStatus}
            invalidText={errors?.selectedProgramStatus?.message}
            labelText={t('programStatus', 'Program status')}
            onChange={(event) => onChange(event.target.value)}
            value={value}>
            <SelectItem text={t('chooseStatus', 'Choose a program status')} value="" />
            {workflowStates.map((state) => (
              <SelectItem key={state.uuid} text={state.concept.display} value={state.uuid}>
                {state.concept.display}
              </SelectItem>
            ))}
          </Select>
        </>
      )}
    />
  );

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
      style: { width: '50%' },
      legendText: '',
      value: enrollmentLocation,
    },
  ];

  if (showProgramStatusField) {
    formGroups.push({
      style: { width: '50%' },
      legendText: '',
      value: programStatusDropdown,
    });
  }

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
        {formGroups.map((group, i) => (
          <FormGroup style={group.style} legendText={group.legendText} key={i}>
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

export default DefaultProgramsForm;
