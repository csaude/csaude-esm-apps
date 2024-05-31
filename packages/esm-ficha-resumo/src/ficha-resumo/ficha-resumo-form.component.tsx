import { Button, ButtonSet, Form, NumberInput, Select, SelectItem, SelectSkeleton, TextInput } from '@carbon/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { ErrorState, OpenmrsDatePicker, parseDate, useLayoutType } from '@openmrs/esm-framework';
import React, { useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { ccrTreatment, hivCare, hivTest, relationship } from './constants';
import styles from './ficha-resumo-form.scss';
import { Concept, FichaResumo, useFichaResumoConcepts as useConfidantRelationship } from './ficha-resumo.resource';

const fichaResumoSchema = z.object({
  preTarvBookNumber: z.number().int().positive().nullable(),
  preTarvBookPage: z.number().int().positive().nullable(),
  preTarvBookLine: z.number().int().positive().nullable(),
  tarvBookNumber: z.number().int().positive().nullable(),
  tarvBookPage: z.number().int().positive().nullable(),
  tarvBookLine: z.number().int().positive().nullable(),
  openingDate: z.date(),
  // Confidant
  confidantName: z.string().nullable(),
  confidantRelationship: z.string().nullable(),
  confidantPhone1: z.string().nullable(),
  confidantPhone2: z.string().nullable(),
  confidantAddress: z.string().nullable(),
  // Family Status
  familyStatus: z.array(
    z.object({
      relativeName: z.string().nullable(),
      relationship: z.string().nullable(),
      otherRelationship: z.string().nullable(),
      age: z.number().int().positive().nullable(),
      hivTest: z.string().nullable(),
      hivCare: z.string().nullable(),
      ccr: z.string().nullable(),
      relativeNid: z.string().nullable(),
    }),
  ),
});

export type FichaResumoFormData = z.infer<typeof fichaResumoSchema>;

interface FichaResumoFormProps {
  fichaResumo: FichaResumo;
  onSubmit: (data: FichaResumoFormData, dirtyFields: object) => Promise<void>;
  onDiscard: () => void;
}

const FichaResumoForm: React.FC<FichaResumoFormProps> = ({ fichaResumo, onSubmit, onDiscard }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';

  const { concepts, error, isLoading } = useConfidantRelationship();

  const defaultValues = {
    preTarvBookNumber: +fichaResumo?.preTarvBookNumber?.value || null,
    preTarvBookPage: +fichaResumo?.preTarvBookPage?.value || null,
    preTarvBookLine: +fichaResumo?.preTarvBookLine?.value || null,
    tarvBookNumber: +fichaResumo?.tarvBookNumber?.value || null,
    tarvBookPage: +fichaResumo?.tarvBookPage?.value || null,
    tarvBookLine: +fichaResumo?.tarvBookLine?.value || null,
    openingDate: fichaResumo ? parseDate(fichaResumo.openingDate.value.toString()) : null,
    // Confidant
    confidantName: fichaResumo?.confidantName?.value.toString() || null,
    confidantRelationship: (fichaResumo?.confidantRelationship?.value as Concept)?.uuid || null,
    confidantPhone1: fichaResumo?.confidantPhone1?.value.toString() || null,
    confidantPhone2: fichaResumo?.confidantPhone2?.value.toString() || null,
    confidantAddress: fichaResumo?.confidantAddress?.value.toString() || null,
    // Family Status
    familyStatus: [
      {
        relativeName: fichaResumo?.familyStatus.at(0)?.relativeName?.value.toString() || null,
        relationship: (fichaResumo?.familyStatus.at(0)?.relationship?.value as Concept)?.uuid || null,
        otherRelationship: fichaResumo?.familyStatus.at(0)?.otherRelationship?.value.toString() || null,
        age: +fichaResumo?.familyStatus.at(0)?.age?.value || null,
        hivTest: (fichaResumo?.familyStatus.at(0)?.hivTest?.value as Concept)?.uuid || null,
        hivCare: (fichaResumo?.familyStatus.at(0)?.hivCare?.value as Concept)?.uuid || null,
        ccr: (fichaResumo?.familyStatus.at(0)?.ccr?.value as Concept)?.uuid || null,
        relativeNid: fichaResumo?.familyStatus.at(0)?.relativeNid?.value.toString() || null,
      },
    ],
  };

  const {
    handleSubmit,
    control,
    formState: { isDirty, dirtyFields },
  } = useForm<FichaResumoFormData>({
    resolver: zodResolver(fichaResumoSchema),
    defaultValues,
  });

  const { fields } = useFieldArray({ control, name: 'familyStatus' });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitHandler = async (data: object) => {
    setIsSubmitting(true);
    await onSubmit(data, dirtyFields);
    setIsSubmitting(false);
  };

  const onError = (error) => {
    console.error(error);
  };

  if (error) {
    return <ErrorState error={error} headerTitle={'Ficha Resumo'} />;
  }

  return (
    <Form className={styles.form} onSubmit={handleSubmit(submitHandler, onError)}>
      <div className={styles.grid}>
        <h6>{t('tarvBook', 'Livro Pré-TARV')}</h6>
        <div className={styles.tarvBook + ' ' + styles.formField}>
          <Controller
            name="preTarvBookNumber"
            control={control}
            render={({ field, fieldState: { invalid }, formState: { errors } }) => (
              <NumberInput
                {...field}
                className="number-input"
                size="sm"
                label={t('bookNumber', 'Nr')}
                onChange={(e, { value }) => field.onChange(value)}
                invalid={invalid}
                invalidText={errors.preTarvBookNumber?.message}
              />
            )}
          />

          <Controller
            name="preTarvBookPage"
            control={control}
            render={({ field, fieldState: { invalid }, formState: { errors } }) => (
              <NumberInput
                {...field}
                className="number-input"
                size="sm"
                label={t('bookPage', 'Página')}
                onChange={(e, { value }) => field.onChange(value)}
                invalid={invalid}
                invalidText={errors.preTarvBookPage?.message}
              />
            )}
          />

          <Controller
            name="preTarvBookLine"
            control={control}
            render={({ field, fieldState: { invalid }, formState: { errors } }) => (
              <NumberInput
                {...field}
                className="number-input"
                size="sm"
                label={t('bookPageLine', 'Linha')}
                onChange={(e, { value }) => field.onChange(value)}
                invalid={invalid}
                invalidText={errors.preTarvBookLine?.message}
              />
            )}
          />
        </div>
        <h6>{t('tarvBook', 'Livro TARV')}</h6>
        <div className={styles.tarvBook + ' ' + styles.formField}>
          <Controller
            name="tarvBookNumber"
            control={control}
            render={({ field, fieldState: { invalid }, formState: { errors } }) => (
              <NumberInput
                {...field}
                size="sm"
                label={t('bookNumber', 'Nr')}
                onChange={(e, { value }) => field.onChange(value)}
                invalid={invalid}
                invalidText={errors.tarvBookNumber?.message}
              />
            )}
          />

          <Controller
            name="tarvBookPage"
            control={control}
            render={({ field, fieldState: { invalid }, formState: { errors } }) => (
              <NumberInput
                {...field}
                size="sm"
                label={t('bookPage', 'Página')}
                onChange={(e, { value }) => field.onChange(value)}
                invalid={invalid}
                invalidText={errors.tarvBookPage?.message}
              />
            )}
          />

          <Controller
            name="tarvBookLine"
            control={control}
            render={({ field, fieldState: { invalid }, formState: { errors } }) => (
              <NumberInput
                {...field}
                size="sm"
                label={t('bookPageLine', 'Linha')}
                onChange={(e, { value }) => field.onChange(value)}
                invalid={invalid}
                invalidText={errors.tarvBookLine?.message}
              />
            )}
          />
        </div>

        <Controller
          name="openingDate"
          control={control}
          render={({ field, fieldState: { invalid }, formState: { errors } }) => (
            <OpenmrsDatePicker
              {...field}
              id="openingDate"
              carbonOptions={{
                className: styles.formField,
              }}
              dateFormat="d/m/Y"
              labelText={t('openingDate', 'Data de Abertura')}
              invalid={invalid}
              invalidText={errors.openingDate?.message}
            />
          )}
        />

        <h6>{t('confidant', 'Confidente')}</h6>
        <div>
          <Controller
            name="confidantName"
            control={control}
            render={({ field, fieldState: { invalid }, formState: { errors } }) => (
              <TextInput
                {...field}
                type="text"
                labelText={t('name', 'Nome')}
                invalid={invalid}
                invalidText={errors.confidantName?.message}
              />
            )}
          />
          {isLoading && <SelectSkeleton />}
          {concepts && (
            <Controller
              name="confidantRelationship"
              control={control}
              render={({ field, fieldState: { invalid }, formState: { errors } }) => (
                <Select
                  {...field}
                  defaultValue={field.value}
                  id="confidantRelationship"
                  labelText={t('relationship', 'Parentesco')}
                  invalid={invalid}
                  invalidText={errors.confidantRelationship?.message}>
                  <SelectItem value="" text="" />
                  {concepts.get(relationship).answers.map((c, i) => (
                    <SelectItem id={i} value={c.uuid} text={c.display} />
                  ))}
                </Select>
              )}
            />
          )}
          <Controller
            name="confidantPhone1"
            control={control}
            render={({ field, fieldState: { invalid }, formState: { errors } }) => (
              <TextInput
                {...field}
                type="text"
                labelText={t('phone1', 'Telefone Celular (1)')}
                invalid={invalid}
                invalidText={errors.confidantPhone1?.message}
              />
            )}
          />
          <Controller
            name="confidantPhone2"
            control={control}
            render={({ field, fieldState: { invalid }, formState: { errors } }) => (
              <TextInput
                {...field}
                type="text"
                labelText={t('phone2', 'Telefone Celular (2)')}
                invalid={invalid}
                invalidText={errors.confidantPhone2?.message}
              />
            )}
          />
          <Controller
            name="confidantAddress"
            control={control}
            render={({ field, fieldState: { invalid }, formState: { errors } }) => (
              <TextInput
                {...field}
                type="text"
                labelText={t('address', 'Endereço')}
                invalid={invalid}
                invalidText={errors.confidantAddress?.message}
              />
            )}
          />
        </div>

        <h6>{t('familyStatus', 'Situação da familia')}</h6>
        {fields.map((field, index) => (
          <div>
            <Controller
              name={`familyStatus.${index}.relativeName`}
              control={control}
              render={({ field, fieldState: { invalid }, formState: { errors } }) => (
                <TextInput
                  {...field}
                  type="text"
                  labelText={t('name', 'Nome')}
                  invalid={invalid}
                  invalidText={errors.familyStatus?.at(index).relativeName?.message}
                />
              )}
            />
            {isLoading && <SelectSkeleton />}
            {concepts && (
              <Controller
                name={`familyStatus.${index}.relationship`}
                control={control}
                render={({ field, fieldState: { invalid }, formState: { errors } }) => (
                  <Select
                    {...field}
                    defaultValue={field.value}
                    id="relationship"
                    labelText={t('relationship', 'Parentesco')}
                    invalid={invalid}
                    invalidText={errors.familyStatus?.at(index).relationship?.message}>
                    <SelectItem value="" text="" />
                    {concepts.get(relationship).answers.map((c, i) => (
                      <SelectItem id={i} value={c.uuid} text={c.display} />
                    ))}
                  </Select>
                )}
              />
            )}
            <Controller
              name={`familyStatus.${index}.otherRelationship`}
              control={control}
              render={({ field, fieldState: { invalid }, formState: { errors } }) => (
                <TextInput
                  {...field}
                  type="text"
                  labelText={t('otherSpecify', 'Outro (Especifique)')}
                  invalid={invalid}
                  invalidText={errors.familyStatus?.at(index).otherRelationship?.message}
                />
              )}
            />

            <Controller
              name={`familyStatus.${index}.age`}
              control={control}
              render={({ field, fieldState: { invalid }, formState: { errors } }) => (
                <NumberInput
                  {...field}
                  size="sm"
                  label={t('idade', 'Idade')}
                  onChange={(e, { value }) => field.onChange(value)}
                  invalid={invalid}
                  invalidText={errors.familyStatus?.at(index).age?.message}
                />
              )}
            />
            {isLoading && <SelectSkeleton />}
            {concepts && (
              <Controller
                name={`familyStatus.${index}.hivTest`}
                control={control}
                render={({ field, fieldState: { invalid }, formState: { errors } }) => (
                  <Select
                    {...field}
                    defaultValue={field.value}
                    id="hivTest"
                    labelText={t('hivTest', 'Teste de HIV')}
                    invalid={invalid}
                    invalidText={errors.familyStatus?.at(index).hivTest?.message}>
                    <SelectItem value="" text="" />
                    {concepts.get(hivTest).answers.map((c, i) => (
                      <SelectItem id={i} value={c.uuid} text={c.display} />
                    ))}
                  </Select>
                )}
              />
            )}
            {isLoading && <SelectSkeleton />}
            {concepts && (
              <Controller
                name={`familyStatus.${index}.hivCare`}
                control={control}
                render={({ field, fieldState: { invalid }, formState: { errors } }) => (
                  <Select
                    {...field}
                    defaultValue={field.value}
                    id="hivCare"
                    labelText={t('hivCare', 'Cuidados de HIV')}
                    invalid={invalid}
                    invalidText={errors.familyStatus?.at(index).hivCare?.message}>
                    <SelectItem value="" text="" />
                    {concepts.get(hivCare).answers.map((c, i) => (
                      <SelectItem id={i} value={c.uuid} text={c.display} />
                    ))}
                  </Select>
                )}
              />
            )}
            {isLoading && <SelectSkeleton />}
            {concepts && (
              <Controller
                name={`familyStatus.${index}.ccr`}
                control={control}
                render={({ field, fieldState: { invalid }, formState: { errors } }) => (
                  <Select
                    {...field}
                    defaultValue={field.value}
                    id="ccr"
                    labelText={t('inCCR', 'Em CCR')}
                    invalid={invalid}
                    invalidText={errors.familyStatus?.at(index).ccr?.message}>
                    <SelectItem value="" text="" />
                    {concepts.get(ccrTreatment).answers.map((c, i) => (
                      <SelectItem id={i} value={c.uuid} text={c.display} />
                    ))}
                  </Select>
                )}
              />
            )}
            <Controller
              name={`familyStatus.${index}.relativeNid`}
              control={control}
              render={({ field, fieldState: { invalid }, formState: { errors } }) => (
                <TextInput
                  {...field}
                  type="text"
                  labelText={t('nid', 'NID')}
                  invalid={invalid}
                  invalidText={errors.familyStatus?.at(index).relativeNid?.message}
                />
              )}
            />
          </div>
        ))}
      </div>

      <ButtonSet className={isTablet ? styles.tablet : styles.desktop}>
        <Button className={styles.button} kind="secondary" onClick={onDiscard}>
          {t('discard', 'Discard')}
        </Button>
        <Button className={styles.button} kind="primary" disabled={!isDirty || isSubmitting} type="submit">
          {t('saveAndClose', 'Save and close')}
        </Button>
      </ButtonSet>
    </Form>
  );
};

export default FichaResumoForm;
