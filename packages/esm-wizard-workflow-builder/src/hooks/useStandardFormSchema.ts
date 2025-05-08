export function useStandardFormSchema() {
  const validationData = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    $id: 'http://json.openmrs.org/workflow.schema.json',
    title: 'Workflow Schema',
    type: 'object',
    required: ['name', 'steps'],
    properties: {
      name: {
        type: 'string',
        description: 'Name of the workflow',
      },
      syncPatient: {
        type: 'boolean',
        description: 'Whether patient synchronization is enabled',
      },
      steps: {
        type: 'array',
        description: 'Array of workflow steps',
        items: {
          type: 'object',
          required: ['id', 'renderType', 'title'],
          properties: {
            id: {
              type: 'string',
              description: 'Unique identifier for the workflow step',
            },
            renderType: {
              type: 'string',
              description: 'Type of rendering for the step',
            },
            title: {
              type: 'string',
              description: 'Title of the step',
            },
            formId: {
              type: 'string',
              description: 'Optional ID of the form associated with the step',
            },
            skippable: {
              type: 'boolean',
              description: 'Indicates if the step can be skipped',
            },
            initiallyOpen: {
              type: 'boolean',
              description: 'Indicates if the step is initially open',
            },
            dependentOn: {
              type: 'string',
              description: 'ID of the step this one depends on',
            },
            visibility: {
              type: 'object',
              description: 'Visibility configuration for the step',
              properties: {
                conditions: {
                  type: 'array',
                  description: 'List of conditions to determine visibility',
                  items: {
                    type: 'object',
                    properties: {},
                    additionalProperties: true,
                  },
                },
              },
            },
            weight: {
              type: 'number',
              description: 'Determines the order/priority of the step',
            },
          },
          additionalProperties: true,
        },
      },
      metadata: {
        type: 'object',
        description: 'Additional metadata',
        additionalProperties: true,
      },
    },
    additionalProperties: true,
  };

  return {
    schema: validationData,
    schemaProperties: validationData.properties,
  };
}
