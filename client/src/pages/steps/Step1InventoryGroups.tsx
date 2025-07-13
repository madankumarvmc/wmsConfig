import { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, AlertCircle, Package, Edit } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import WizardLayout from '@/components/WizardLayout';

import { useWizard } from '@/contexts/WizardContext';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { InventoryGroup, InsertInventoryGroup } from '../../../../shared/schema';
import { 
  categories, 
  skuClassTypes, 
  skuClasses, 
  uoms, 
  buckets, 
  channels, 
  customers 
} from '@/lib/mockData';

const inventoryGroupSchema = z.object({
  name: z.string().optional(),
  storageIdentifiers: z.object({
    category: z.string().optional(),
    skuClassType: z.string().optional(),
    skuClass: z.string().optional(),
    uom: z.string().optional(),
    bucket: z.string().optional(),
    specialStorageIndicator: z.string().optional()
  }),
  lineIdentifiers: z.object({
    channel: z.string().optional(),
    customer: z.string().optional()
  }),
  description: z.string().optional()
});

type InventoryGroupForm = z.infer<typeof inventoryGroupSchema>;

export default function Step1InventoryGroups() {
  const [, setLocation] = useLocation();
  const { state, dispatch } = useWizard();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingGroup, setEditingGroup] = useState<InventoryGroup | null>(null);

  const { data: inventoryGroups = [], isLoading } = useQuery<InventoryGroup[]>({
    queryKey: ['/api/inventory-groups'],
  });

  const form = useForm<InventoryGroupForm>({
    resolver: zodResolver(inventoryGroupSchema),
    defaultValues: {
      name: '',
      storageIdentifiers: {
        category: '',
        skuClassType: '',
        skuClass: '',
        uom: '',
        bucket: '',
        specialStorageIndicator: ''
      },
      lineIdentifiers: {
        channel: '',
        customer: ''
      },
      description: ''
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertInventoryGroup) => {
      const response = await apiRequest('POST', '/api/inventory-groups', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory-groups'] });
      toast({ title: "Success", description: "Inventory group created successfully" });
      form.reset();
      setIsFormVisible(false);
      setEditingGroup(null);
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to create inventory group",
        variant: "destructive" 
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: InsertInventoryGroup }) => {
      const response = await apiRequest('PUT', `/api/inventory-groups/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory-groups'] });
      toast({ title: "Success", description: "Inventory group updated successfully" });
      form.reset();
      setIsFormVisible(false);
      setEditingGroup(null);
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to update inventory group",
        variant: "destructive" 
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/inventory-groups/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory-groups'] });
      toast({ title: "Success", description: "Inventory group deleted successfully" });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to delete inventory group",
        variant: "destructive" 
      });
    }
  });

  const onSubmit = (data: InventoryGroupForm) => {
    // Check for duplicate combinations
    const isDuplicate = inventoryGroups.some(group => {
      const groupStorageIds = group.storageIdentifiers as any;
      const groupLineIds = group.lineIdentifiers as any;
      
      if (editingGroup && group.id === editingGroup.id) return false; // Skip self when editing
      
      return (
        groupStorageIds?.category === data.storageIdentifiers.category &&
        groupStorageIds?.skuClassType === data.storageIdentifiers.skuClassType &&
        groupStorageIds?.skuClass === data.storageIdentifiers.skuClass &&
        groupStorageIds?.uom === data.storageIdentifiers.uom &&
        groupStorageIds?.bucket === data.storageIdentifiers.bucket &&
        groupLineIds?.channel === data.lineIdentifiers.channel &&
        groupLineIds?.customer === data.lineIdentifiers.customer
      );
    });

    if (isDuplicate) {
      toast({
        title: "Duplicate Combination",
        description: "An inventory group with this exact combination of storage and line identifiers already exists.",
        variant: "destructive"
      });
      return;
    }

    const payload: InsertInventoryGroup = {
      userId: 1, // Mock user ID
      name: data.name,
      storageIdentifiers: data.storageIdentifiers,
      lineIdentifiers: data.lineIdentifiers,
      description: data.description || null
    };

    if (editingGroup) {
      updateMutation.mutate({ id: editingGroup.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleEdit = (group: InventoryGroup) => {
    const storageIds = group.storageIdentifiers as any;
    const lineIds = group.lineIdentifiers as any;
    
    setEditingGroup(group);
    form.reset({
      name: group.name,
      storageIdentifiers: {
        category: storageIds?.category || '',
        skuClassType: storageIds?.skuClassType || '',
        skuClass: storageIds?.skuClass || '',
        uom: storageIds?.uom || '',
        bucket: storageIds?.bucket || '',
        specialStorageIndicator: storageIds?.specialStorageIndicator || ''
      },
      lineIdentifiers: {
        channel: lineIds?.channel || '',
        customer: lineIds?.customer || ''
      },
      description: group.description || ''
    });
    setIsFormVisible(true);
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleAddNew = () => {
    setEditingGroup(null);
    form.reset();
    setIsFormVisible(true);
  };

  const handleCancel = () => {
    setIsFormVisible(false);
    setEditingGroup(null);
    form.reset();
  };

  const handleNext = () => {
    if (inventoryGroups.length === 0) {
      toast({ 
        title: "At least one inventory group required", 
        description: "Please create at least one inventory group before proceeding.",
        variant: "destructive" 
      });
      return;
    }
    dispatch({ type: 'COMPLETE_STEP', payload: 1 });
    dispatch({ type: 'SET_CURRENT_STEP', payload: 2 });
    setLocation('/step2');
  };

  const handlePrevious = () => {
    setLocation('/');
  };

  const getIdentifiersDisplay = (group: InventoryGroup) => {
    const storageIds = group.storageIdentifiers as any;
    const lineIds = group.lineIdentifiers as any;
    
    return {
      storage: `${storageIds?.category || 'N/A'} | ${storageIds?.uom || 'N/A'} | ${storageIds?.bucket || 'N/A'}`,
      line: `${lineIds?.channel || 'N/A'} | ${lineIds?.customer || 'N/A'}`
    };
  };

  return (
    <WizardLayout
      title="Inventory Groups"
      description="Define Storage Instruction (SI) and Location Instruction (LI) combinations that will be used throughout your warehouse configuration."
      currentStep={1}
      totalSteps={7}
      onNext={handleNext}
      onPrevious={handlePrevious}
      nextLabel="Continue to Task Sequences"
      previousLabel="Back to Home"
      isNextDisabled={inventoryGroups.length === 0}
    >
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-black" />
            <h3 className="text-lg font-medium">Inventory Groups ({inventoryGroups.length})</h3>
          </div>
          <Button 
            onClick={handleAddNew}
            disabled={isFormVisible}
            className="bg-black hover:bg-gray-800 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Inventory Group
          </Button>
        </div>

        {/* Information Alert */}
        <Alert className="border-gray-200 bg-gray-50">
          <AlertCircle className="h-4 w-4 text-gray-600" />
          <AlertDescription className="text-gray-800">
            <strong>What are Inventory Groups?</strong> These define unique combinations of Storage Instructions (category, UOM, quality) and Line Instructions (channel, customer) that determine how products are stored and picked in your warehouse.
          </AlertDescription>
        </Alert>

        {/* Create/Edit Form */}
        {isFormVisible && (
          <Card className="border-2 border-gray-200">
            <CardHeader>
              <CardTitle>{editingGroup ? 'Edit' : 'Create'} Inventory Group</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Group Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., L0 Bulk Good Retail" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Input placeholder="Optional description" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  {/* Storage Identifiers */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Storage Identifiers</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="storageIdentifiers.category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="z-[9999] relative">
                                {categories.map((cat) => (
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
                        control={form.control}
                        name="storageIdentifiers.skuClassType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SKU Class Type *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="z-[9999] relative">
                                {skuClassTypes.map((type) => (
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
                        control={form.control}
                        name="storageIdentifiers.skuClass"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SKU Class *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select class" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="z-[9999] relative">
                                {skuClasses.map((cls) => (
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
                        control={form.control}
                        name="storageIdentifiers.uom"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>UOM Level *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select UOM" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="z-[9999] relative">
                                {uoms.map((uom) => (
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
                        control={form.control}
                        name="storageIdentifiers.bucket"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quality Bucket *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select bucket" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="z-[9999] relative">
                                {buckets.map((bucket) => (
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
                        control={form.control}
                        name="storageIdentifiers.specialStorageIndicator"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Special Storage</FormLabel>
                            <FormControl>
                              <Input placeholder="Optional indicator" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Line Identifiers */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Line Identifiers</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="lineIdentifiers.channel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Channel *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select channel" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="z-[9999] relative">
                                {channels.map((channel) => (
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
                        control={form.control}
                        name="lineIdentifiers.customer"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Customer *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select customer" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="z-[9999] relative">
                                {customers.map((customer) => (
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

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createMutation.isPending || updateMutation.isPending}
                      className="bg-black hover:bg-gray-800 text-white"
                    >
                      {createMutation.isPending || updateMutation.isPending 
                        ? 'Saving...' 
                        : editingGroup ? 'Update Group' : 'Create Group'
                      }
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Existing Groups List */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          </div>
        ) : inventoryGroups.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Existing Inventory Groups</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Storage Identifiers</TableHead>
                    <TableHead>Line Identifiers</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryGroups.map((group) => {
                    const display = getIdentifiersDisplay(group);
                    return (
                      <TableRow key={group.id}>
                        <TableCell className="font-medium">{group.name}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <Badge variant="secondary" className="mr-1 mb-1">
                              {display.storage}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <Badge variant="outline" className="mr-1 mb-1">
                              {display.line}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {group.description || '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(group)}
                              disabled={isFormVisible}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(group.id)}
                              disabled={deleteMutation.isPending}
                              className="text-red-600 hover:text-red-800 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Inventory Groups</h3>
              <p className="text-gray-600 mb-6 max-w-md">
                Create your first inventory group by defining storage and line identifier combinations. 
                These will be used throughout your warehouse configuration.
              </p>
              <Button 
                onClick={handleAddNew}
                className="bg-black hover:bg-gray-800 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Inventory Group
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </WizardLayout>
  );
}