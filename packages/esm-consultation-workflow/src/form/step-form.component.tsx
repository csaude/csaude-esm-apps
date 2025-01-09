import React, { ReactElement, useRef } from 'react';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { useWizard } from 'react-use-wizard';

type StepFormProps<T> = {
  values: T;
  onSubmit: SubmitHandler<T>;
};

/**
 * Encapsulates react-hook-form and provides a way to submit the form when
 * changing wizard steps.
 * Based on https://react-hook-form.com/advanced-usage#SmartFormComponent.
 */
const StepForm = <T,>(props: React.PropsWithChildren<StepFormProps<T>>) => {
  const formRef = useRef<HTMLFormElement>(null);
  const methods = useForm({ values: props.values });
  const { handleStep } = useWizard();
  handleStep(() => {
    formRef.current.requestSubmit();
  });
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(props.onSubmit)} ref={formRef}>
        {React.Children.map(props.children, (child: ReactElement) => {
          if (!child) {
            return null;
          }
          return child.props.name
            ? React.createElement(child.type, {
                ...{
                  ...child.props,
                  control: methods.control,
                  key: child.props.name,
                },
              })
            : child;
        })}
      </form>
    </FormProvider>
  );
};

export default StepForm;
