import React, { ReactElement, useRef } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useWizard } from 'react-use-wizard';

type StepFormProps<T> = {
  values: T;
  onSubmit: SubmitHandler<T>;
};

// https://react-hook-form.com/advanced-usage#SmartFormComponent
const StepForm = <T,>(props: React.PropsWithChildren<StepFormProps<T>>) => {
  const formRef = useRef<HTMLFormElement>(null);
  const { handleSubmit, control } = useForm({ values: props.values });
  const { handleStep } = useWizard();
  handleStep(() => {
    formRef.current.requestSubmit();
  });
  return (
    <form onSubmit={handleSubmit(props.onSubmit)} ref={formRef}>
      {React.Children.map(props.children, (child: ReactElement) => {
        return child.props.name
          ? React.createElement(child.type, {
              ...{
                ...child.props,
                control: control,
                key: child.props.name,
              },
            })
          : child;
      })}
    </form>
  );
};

export default StepForm;
