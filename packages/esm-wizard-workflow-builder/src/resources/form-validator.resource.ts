import type { Schema } from '../types';
import type { ConfigObject } from '../config-schema';

interface Field {
  label: string;
  concept: string;
  id?: string;
  type?: string;
}

interface ErrorMessageResponse {
  errorMessage?: string;
  field: Field;
}

interface WarningMessageResponse {
  field: Field;
  warningMessage?: string;
}

export const handleFormValidation = async (
  schema: string | Schema,
  configObject: ConfigObject['dataTypeToRenderingMap'],
): Promise<[Array<ErrorMessageResponse>, Array<WarningMessageResponse>]> => {
  const errors: Array<ErrorMessageResponse> = [];
  const warnings: Array<WarningMessageResponse> = [];

  if (schema) {
    const parsedForm: Schema = typeof schema === 'string' ? JSON.parse(schema) : schema;

    const asyncTasks: Array<Promise<void>> = [];

    // CHECK THIS LATER
    // ---------------------------------------------------------------------------|
    // parsedForm.pages?.forEach((page) =>
    //   page.sections?.forEach((section: { questions: Array<Question> }) =>
    //     section.questions?.forEach((question) => {
    //       asyncTasks.push(
    //         handleQuestionValidation(question, errors, configObject, warnings),
    //         handleAnswerValidation(question, errors),
    //         handlePatientIdentifierValidation(question, errors),
    //       );
    //       if (question.type === 'obsGroup') {
    //         question?.questions?.forEach((obsGrpQuestion) =>
    //           asyncTasks.push(
    //             handleQuestionValidation(obsGrpQuestion, errors, configObject, warnings),
    //             handleAnswerValidation(obsGrpQuestion, errors),
    //           ),
    //         );
    //       }
    //     }),
    //   ),
    // );
    // -------------------------------------------------------------------------------|

    await Promise.all(asyncTasks);
  }

  return [errors, warnings]; // Return empty arrays if schema is falsy
};
