import React, { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { FieldStatusIndicator } from '@/components/FieldStatusIndicator';
import { useFetchedConfigurations } from '@/contexts/FetchedConfigurationsContext';

interface TrackedFormFieldProps {
  name: string;
  label: string;
  fieldPath: string;
  required?: boolean;
  children: (field: any) => React.ReactNode;
  className?: string;
}

export function TrackedFormField({
  name,
  label,
  fieldPath,
  required = false,
  children,
  className
}: TrackedFormFieldProps) {
  const { control } = useFormContext();
  const { trackFieldValue } = useFetchedConfigurations();
  
  // Watch the field value for changes
  const fieldValue = useWatch({
    control,
    name
  });

  // Track field changes in real-time
  useEffect(() => {
    trackFieldValue(fieldPath, fieldValue);
  }, [fieldValue, fieldPath, trackFieldValue]);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel className="flex items-center space-x-2">
            <span>
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </span>
            <FieldStatusIndicator 
              fieldPath={fieldPath}
              className="ml-1"
            />
          </FormLabel>
          <FormControl>
            {children(field)}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// Convenience wrapper for commonly used input types
export function TrackedInput({
  name,
  label,
  fieldPath,
  required = false,
  type = "text",
  placeholder,
  className,
  ...inputProps
}: {
  name: string;
  label: string;
  fieldPath: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  className?: string;
  [key: string]: any;
}) {
  return (
    <TrackedFormField
      name={name}
      label={label}
      fieldPath={fieldPath}
      required={required}
      className={className}
    >
      {(field) => (
        <input
          type={type}
          placeholder={placeholder}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          {...field}
          {...inputProps}
        />
      )}
    </TrackedFormField>
  );
}

// Convenience wrapper for Select components
export function TrackedSelect({
  name,
  label,
  fieldPath,
  required = false,
  placeholder,
  children,
  className
}: {
  name: string;
  label: string;
  fieldPath: string;
  required?: boolean;
  placeholder?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <TrackedFormField
      name={name}
      label={label}
      fieldPath={fieldPath}
      required={required}
      className={className}
    >
      {(field) => (
        <select
          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={field.value}
          onChange={field.onChange}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {children}
        </select>
      )}
    </TrackedFormField>
  );
}