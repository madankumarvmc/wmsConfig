import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, AlertCircle, Package } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import WizardLayout from '@/components/WizardLayout';

import { useWizard } from '@/contexts/WizardContext';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { InventoryGroup, InsertInventoryGroup } from '../../../../shared/schema';

const inventoryGroupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  storageInstruction: z.string().min(1, 'Storage Instruction is required'),
  locationInstruction: z.string().min(1, 'Location Instruction is required'),
  description: z.string().optional()
});

type InventoryGroupForm = z.infer<typeof inventoryGroupSchema>;

export default function Step1InventoryGroups() {
  const { state, dispatch } = useWizard();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFormVisible, setIsFormVisible] = useState(false);

  const { data: inventoryGroups = [], isLoading } = useQuery<InventoryGroup[]>({
    queryKey: ['/api/inventory-groups'],
  });

  const form = useForm<InventoryGroupForm>({
    resolver: zodResolver(inventoryGroupSchema),
    defaultValues: {
      name: '',
      storageInstruction: '',
      locationInstruction: '',
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
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to create inventory group",
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
    // Check for duplicate SI+LI combinations
    const isDuplicate = inventoryGroups.some(group => 
      group.storageInstruction === data.storageInstruction && 
      group.locationInstruction === data.locationInstruction
    );

    if (isDuplicate) {
      toast({
        title: "Duplicate Combination",
        description: "An inventory group with this Storage Instruction and Location Instruction combination already exists.",
        variant: "destructive"
      });
      return;
    }

    createMutation.mutate({
      userId: 1, // Mock user ID
      name: data.name,
      storageInstruction: data.storageInstruction,
      locationInstruction: data.locationInstruction,
      description: data.description || null
    });
  };

  const handleNext = () => {
    if (inventoryGroups.length === 0) {
      toast({
        title: "No Inventory Groups",
        description: "Please create at least one inventory group before proceeding.",
        variant: "destructive"
      });
      return;
    }

    dispatch({ type: 'COMPLETE_STEP', payload: 1 });
    dispatch({ type: 'SET_CURRENT_STEP', payload: 2 });
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const storageInstructionOptions = [
    "L0", "L1", "L2", "L3", "L4", "L5",
    "REPLEN", "RESERVE", "FORWARD", "BULK"
  ];

  const locationInstructionOptions = [
    "AREA", "ZONE", "BIN", "POSITION", 
    "WAREHOUSE", "SECTION", "AISLE", "LEVEL"
  ];

  return (
    <WizardLayout
      title="Inventory Groups"
      description="Define Storage Instruction (SI) and Location Instruction (LI) combinations that will be used throughout your warehouse configuration."
      currentStep={1}
      totalSteps={6}
      onNext={handleNext}
      nextLabel="Continue to Task Sequences"
      isNextDisabled={inventoryGroups.length === 0}
    >
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-medium">Inventory Groups ({inventoryGroups.length})</h3>
          </div>
          <Button 
            onClick={() => setIsFormVisible(true)}
            disabled={isFormVisible}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Inventory Group
          </Button>
        </div>

        {/* Information Alert */}
        <Alert className="border-blue-200 bg-blue-50">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>What are Inventory Groups?</strong> These define unique combinations of Storage Instructions (SI) and Location Instructions (LI) that determine how products are stored and picked in your warehouse. Each group will be referenced in task sequences, pick strategies, and allocation rules.
          </AlertDescription>
        </Alert>

        {/* Create Form */}
        {isFormVisible && (
          <Card className="border-2 border-blue-200">
            <CardHeader>
              <CardTitle>Create New Inventory Group</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Group Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., L0 Inventory Group" {...field} />
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="storageInstruction"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Storage Instruction (SI) *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select storage instruction" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {storageInstructionOptions.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
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
                      name="locationInstruction"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location Instruction (LI) *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select location instruction" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {locationInstructionOptions.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsFormVisible(false);
                        form.reset();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {createMutation.isPending ? 'Creating...' : 'Create Group'}
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : inventoryGroups.length > 0 ? (
          <div className="space-y-4">
            <Separator />
            <h4 className="font-medium text-gray-900">Existing Inventory Groups</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inventoryGroups.map((group) => (
                <Card key={group.id} className="border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h5 className="font-medium text-gray-900">{group.name}</h5>
                        {group.description && (
                          <p className="text-sm text-gray-600 mt-1">{group.description}</p>
                        )}
                      </div>
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
                    
                    <div className="flex space-x-2">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        SI: {group.storageInstruction}
                      </Badge>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        LI: {group.locationInstruction}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Inventory Groups</h3>
              <p className="text-gray-600 mb-6 max-w-md">
                Create your first inventory group by defining a Storage Instruction and Location Instruction combination. 
                These will be used throughout your warehouse configuration.
              </p>
              <Button 
                onClick={() => setIsFormVisible(true)}
                className="bg-blue-600 hover:bg-blue-700"
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