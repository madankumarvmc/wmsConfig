import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useFetchedConfigurations } from '@/contexts/FetchedConfigurationsContext';

interface FieldStatusIndicatorProps {
  fieldPath: string;
  className?: string;
  showTooltip?: boolean;
  currentValue?: any;
}

export function FieldStatusIndicator({ fieldPath, className, showTooltip = true, currentValue }: FieldStatusIndicatorProps) {
  const { getFieldSource, trackFieldValue } = useFetchedConfigurations();
  const fieldSource = getFieldSource(fieldPath);

  // Track field value changes in real-time
  useEffect(() => {
    if (currentValue !== undefined) {
      trackFieldValue(fieldPath, currentValue);
    }
  }, [currentValue, fieldPath, trackFieldValue]);

  const getIndicatorProps = () => {
    switch (fieldSource.source) {
      case 'api':
        return {
          symbol: '🟢',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          label: 'API Data',
          description: 'Field populated from fetched API data'
        };
      case 'modified':
        return {
          symbol: '🔵',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          label: 'Modified',
          description: 'Field modified after API fetch'
        };
      case 'empty':
      default:
        return {
          symbol: '⚪',
          color: 'text-gray-400',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          label: 'Empty',
          description: 'Field not populated by API'
        };
    }
  };

  const props = getIndicatorProps();

  if (showTooltip) {
    return (
      <div className={cn(
        'inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-medium cursor-help',
        props.bgColor,
        props.borderColor,
        'border',
        className
      )} title={`${props.label}: ${props.description}`}>
        <span className="text-xs">{props.symbol}</span>
      </div>
    );
  }

  return (
    <span className={cn('text-xs', className)}>
      {props.symbol}
    </span>
  );
}

interface FieldStatusBadgeProps {
  fieldPath: string;
  className?: string;
}

export function FieldStatusBadge({ fieldPath, className }: FieldStatusBadgeProps) {
  const { getFieldSource } = useFetchedConfigurations();
  const fieldSource = getFieldSource(fieldPath);

  const getBadgeProps = () => {
    switch (fieldSource.source) {
      case 'api':
        return {
          symbol: '🟢',
          label: 'API',
          color: 'text-green-700',
          bgColor: 'bg-green-100',
          borderColor: 'border-green-300'
        };
      case 'modified':
        return {
          symbol: '🔵',
          label: 'MOD',
          color: 'text-blue-700',
          bgColor: 'bg-blue-100',
          borderColor: 'border-blue-300'
        };
      case 'empty':
      default:
        return {
          symbol: '⚪',
          label: 'EMPTY',
          color: 'text-gray-500',
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-300'
        };
    }
  };

  const props = getBadgeProps();

  return (
    <span className={cn(
      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border',
      props.color,
      props.bgColor,
      props.borderColor,
      className
    )}>
      <span className="mr-1">{props.symbol}</span>
      {props.label}
    </span>
  );
}

interface FieldStatusLegendProps {
  className?: string;
}

export function FieldStatusLegend({ className }: FieldStatusLegendProps) {
  return (
    <div className={cn('flex items-center space-x-4 text-sm', className)}>
      <div className="flex items-center space-x-1">
        <span>🟢</span>
        <span className="text-gray-600">API Data</span>
      </div>
      <div className="flex items-center space-x-1">
        <span>🔵</span>
        <span className="text-gray-600">Modified</span>
      </div>
      <div className="flex items-center space-x-1">
        <span>⚪</span>
        <span className="text-gray-600">Empty</span>
      </div>
    </div>
  );
}