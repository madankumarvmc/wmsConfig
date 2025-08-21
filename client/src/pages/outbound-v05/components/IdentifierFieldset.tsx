import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Control, useWatch } from 'react-hook-form';
import { useV05FormOptions } from '@/hooks/useV05FormOptions';
import { FieldStatusIndicator } from '@/components/FieldStatusIndicator';

interface IdentifierFieldsetProps {
  control: Control<any>;
  showStorageIdentifiers?: boolean;
  showLineIdentifiers?: boolean;
  showLocationIdentifiers?: boolean;
  title?: string;
  configType?: 'lineSplit' | 'taskSequences' | 'taskStrategy' | 'binSearch';
  configIndex?: number;
}

export default function IdentifierFieldset({
  control,
  showStorageIdentifiers = true,
  showLineIdentifiers = true,
  showLocationIdentifiers = false,
  title = "Identifiers",
  configType = 'lineSplit',
  configIndex = 0
}: IdentifierFieldsetProps) {
  const formOptions = useV05FormOptions();
  
  // Watch all field values for real-time tracking
  const watchedValues = useWatch({ control });
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-4">{title}</h4>
        
        {/* Storage Identifiers */}
        {showStorageIdentifiers && (
          <>
            <div className="mb-4">
              <h5 className="text-sm font-medium text-gray-700 mb-3">Storage Identifiers</h5>
              <p className="text-xs text-gray-500 mb-4">Filters by SKU attributes.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={control}
                  name="storageIdentifiers.category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2">
                        <span>Category</span>
                        <FieldStatusIndicator 
                          fieldPath={`${configType}.${configIndex}.storageIdentifiers.category`}
                          className="ml-1"
                          currentValue={watchedValues?.storageIdentifiers?.category}
                        />
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="z-[9999] relative">
                          {formOptions.categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="storageIdentifiers.skuClassType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2">
                        <span>SKU Class Type</span>
                        <FieldStatusIndicator 
                          fieldPath={`${configType}.${configIndex}.storageIdentifiers.skuClassType`}
                          className="ml-1"
                          currentValue={watchedValues?.storageIdentifiers?.skuClassType}
                        />
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="z-[9999] relative">
                          {formOptions.skuClassTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="storageIdentifiers.skuClass"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2">
                        <span>SKU Class</span>
                        <FieldStatusIndicator 
                          fieldPath={`${configType}.${configIndex}.storageIdentifiers.skuClass`}
                          className="ml-1"
                          currentValue={watchedValues?.storageIdentifiers?.skuClass}
                        />
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select class" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="z-[9999] relative">
                          {formOptions.skuClasses.map((cls) => (
                            <SelectItem key={cls} value={cls}>
                              {cls}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="storageIdentifiers.uom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2">
                        <span>UOM Level</span>
                        <FieldStatusIndicator 
                          fieldPath={`${configType}.${configIndex}.storageIdentifiers.uom`}
                          className="ml-1"
                        />
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || 'L0'}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select UOM" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="z-[9999] relative">
                          {formOptions.uoms.map((uom) => (
                            <SelectItem key={uom} value={uom}>
                              {uom}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="storageIdentifiers.bucket"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2">
                        <span>Quality Bucket</span>
                        <FieldStatusIndicator 
                          fieldPath={`${configType}.${configIndex}.storageIdentifiers.bucket`}
                          className="ml-1"
                        />
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || 'Good'}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select bucket" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="z-[9999] relative">
                          {formOptions.qualityBuckets.map((bucket) => (
                            <SelectItem key={bucket} value={bucket}>
                              {bucket}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="storageIdentifiers.specialStorageIndicator"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2">
                        <span>Special Storage</span>
                        <FieldStatusIndicator 
                          fieldPath={`${configType}.${configIndex}.storageIdentifiers.specialStorageIndicator`}
                          className="ml-1"
                        />
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., CHILL, HAZMAT" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="storageIdentifiers.preferredHUKind"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-2">
                        <span>Preferred HU Kind</span>
                        <FieldStatusIndicator 
                          fieldPath={`${configType}.${configIndex}.storageIdentifiers.preferredHUKind`}
                          className="ml-1"
                        />
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select HU kind" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="z-[9999] relative">
                          {formOptions.huKinds.map((kind) => (
                            <SelectItem key={kind} value={kind}>
                              {kind}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </>
        )}

        {showStorageIdentifiers && showLineIdentifiers && <Separator />}

        {/* Line Identifiers */}
        {showLineIdentifiers && (
          <div className="mb-4">
            <h5 className="text-sm font-medium text-gray-700 mb-3">Line Identifiers</h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={control}
                name="lineIdentifiers.channel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2">
                      <span>Channel</span>
                      <FieldStatusIndicator 
                        fieldPath={`${configType}.${configIndex}.lineIdentifiers.channel`}
                        className="ml-1"
                        currentValue={watchedValues?.lineIdentifiers?.channel}
                      />
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select channel" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="z-[9999] relative">
                        {formOptions.channels.map((channel) => (
                          <SelectItem key={channel} value={channel}>
                            {channel}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="lineIdentifiers.vendor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2">
                      <span>Vendor</span>
                      <FieldStatusIndicator 
                        fieldPath={`${configType}.${configIndex}.lineIdentifiers.vendor`}
                        className="ml-1"
                        currentValue={watchedValues?.lineIdentifiers?.vendor}
                      />
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter vendor" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="lineIdentifiers.asnType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2">
                      <span>ASN Type</span>
                      <FieldStatusIndicator 
                        fieldPath={`${configType}.${configIndex}.lineIdentifiers.asnType`}
                        className="ml-1"
                      />
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select ASN type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="z-[9999] relative">
                        {formOptions.asnTypes.map((asnType) => (
                          <SelectItem key={asnType} value={asnType}>
                            {asnType}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="lineIdentifiers.customer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2">
                      <span>Customer</span>
                      <FieldStatusIndicator 
                        fieldPath={`${configType}.${configIndex}.lineIdentifiers.customer`}
                        className="ml-1"
                      />
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="z-[9999] relative">
                        {formOptions.customers.map((customer) => (
                          <SelectItem key={customer} value={customer}>
                            {customer}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        {showLineIdentifiers && showLocationIdentifiers && <Separator />}

        {/* Location Identifiers */}
        {showLocationIdentifiers && (
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-3">Location Identifiers</h5>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <FormField
                control={control}
                name="locationIdentifiers.area"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2">
                      <span>Area</span>
                      <FieldStatusIndicator 
                        fieldPath={`${configType}.${configIndex}.locationIdentifiers.area`}
                        className="ml-1"
                      />
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter area" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="locationIdentifiers.zone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2">
                      <span>Zone</span>
                      <FieldStatusIndicator 
                        fieldPath={`${configType}.${configIndex}.locationIdentifiers.zone`}
                        className="ml-1"
                      />
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter zone" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="locationIdentifiers.aisle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2">
                      <span>Aisle</span>
                      <FieldStatusIndicator 
                        fieldPath={`${configType}.${configIndex}.locationIdentifiers.aisle`}
                        className="ml-1"
                      />
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter aisle" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="locationIdentifiers.bin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center space-x-2">
                      <span>Bin</span>
                      <FieldStatusIndicator 
                        fieldPath={`${configType}.${configIndex}.locationIdentifiers.bin`}
                        className="ml-1"
                      />
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter bin" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}