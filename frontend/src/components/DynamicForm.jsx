import React from 'react';
import { FormField } from './FormField';

export function DynamicForm({
  formSchema,
  formValues,
  confidenceScores,
  fieldValidations,
  onFieldChange
}) {
  if (!formSchema || !formSchema.fields) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {formSchema.fields.map(field => (
        <div key={field.id} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
          <FormField
            field={field}
            value={formValues[field.id]}
            confidenceScore={confidenceScores[field.id]}
            validationResult={fieldValidations[field.id]}
            onChange={onFieldChange}
          />
        </div>
      ))}
    </div>
  );
}
