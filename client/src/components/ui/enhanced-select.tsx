"use client"

import * as React from "react"
import { AlertTriangle } from "lucide-react"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "./select"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip"

interface EnhancedSelectOption {
  value: string
  label: string
  isStandard?: boolean
}

interface EnhancedSelectProps {
  value?: string | null
  onValueChange?: (value: string) => void
  options: Array<string | EnhancedSelectOption>
  placeholder?: string
  className?: string
  disabled?: boolean
  name?: string
}

const EnhancedSelect = React.forwardRef<
  HTMLButtonElement,
  EnhancedSelectProps
>(({ value, onValueChange, options, placeholder, className, disabled, name, ...props }, ref) => {
  // Convert string options to EnhancedSelectOption format
  const normalizedOptions: EnhancedSelectOption[] = options.map(option => 
    typeof option === 'string' 
      ? { value: option, label: option, isStandard: true }
      : option
  )

  // Check if current value exists in standard options
  const isUnknownValue = value && !normalizedOptions.some(option => option.value === value)
  
  // Create enhanced options list including unknown value if needed
  const enhancedOptions = React.useMemo(() => {
    const opts = [...normalizedOptions]
    
    if (isUnknownValue && value) {
      // Add unknown value to the top of the list with special styling
      opts.unshift({
        value: value,
        label: value,
        isStandard: false
      })
    }
    
    return opts
  }, [normalizedOptions, isUnknownValue, value])

  const triggerContent = (
    <div className="flex items-center w-full">
      <SelectValue placeholder={placeholder} />
      {isUnknownValue && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <AlertTriangle className="h-4 w-4 text-amber-500 ml-2 flex-shrink-0" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Non-standard value from fetched configuration</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  )

  return (
    <Select 
      value={value || undefined} 
      onValueChange={onValueChange}
      disabled={disabled}
      name={name}
      {...props}
    >
      <SelectTrigger 
        ref={ref}
        className={cn(
          isUnknownValue && "border-amber-300 bg-amber-50",
          className
        )}
      >
        {triggerContent}
      </SelectTrigger>
      <SelectContent className="z-[9999] relative">
        {enhancedOptions.map((option) => (
          <SelectItem 
            key={option.value} 
            value={option.value}
            className={cn(
              !option.isStandard && "bg-amber-50 border-l-2 border-amber-400"
            )}
          >
            <div className="flex items-center w-full">
              <span>{option.label}</span>
              {!option.isStandard && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <AlertTriangle className="h-3 w-3 text-amber-500 ml-2" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Non-standard value from fetched data</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </SelectItem>
        ))}
        {enhancedOptions.length === 0 && (
          <SelectItem value="__empty__" disabled>
            No options available
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  )
})

EnhancedSelect.displayName = "EnhancedSelect"

export { EnhancedSelect, type EnhancedSelectOption, type EnhancedSelectProps }