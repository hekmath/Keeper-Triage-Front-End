// components/settings/DocumentForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { NewKnowledgeDocument, KnowledgeDocument } from '@/types/chat';
import { FileText, Plus, Save } from 'lucide-react';

const documentFormSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title must be 255 characters or less'),
  content: z.string().min(10, 'Content must be at least 10 characters long'),
  metadata: z
    .object({
      category: z.string().optional(),
      tags: z.string().optional(),
    })
    .optional(),
});

type DocumentFormData = z.infer<typeof documentFormSchema>;

interface DocumentFormProps {
  document?: KnowledgeDocument | null;
  onSubmit: (data: NewKnowledgeDocument) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function DocumentForm({
  document,
  onSubmit,
  onCancel,
  isLoading = false,
}: DocumentFormProps) {
  const isEditing = !!document;

  const form = useForm<DocumentFormData>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: {
      title: document?.title || '',
      content: document?.content || '',
      metadata: {
        category: document?.metadata?.category || '',
        tags: document?.metadata?.tags || '',
      },
    },
  });

  const handleSubmit = async (data: DocumentFormData) => {
    const submitData: NewKnowledgeDocument = {
      title: data.title,
      content: data.content,
      metadata: {
        category: data.metadata?.category || '',
        tags: data.metadata?.tags || '',
        updatedBy: 'agent', // You could get this from auth context
      },
    };

    await onSubmit(submitData);

    if (!isEditing) {
      form.reset();
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <div className="bg-blue-100 w-10 h-10 rounded-lg flex items-center justify-center">
            {isEditing ? (
              <Save className="h-5 w-5 text-blue-600" />
            ) : (
              <Plus className="h-5 w-5 text-blue-600" />
            )}
          </div>
          <div>
            <CardTitle>
              {isEditing ? 'Edit Document' : 'Add New Document'}
            </CardTitle>
            <CardDescription>
              {isEditing
                ? 'Update the document content and regenerate embeddings'
                : 'Add content to the knowledge base for AI responses'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Document Title</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., Return Policy, Shipping Guidelines..."
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Enter the document content that the AI should use to answer customer questions..."
                      className="min-h-[200px] resize-none"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-gray-500">
                    Characters: {field.value?.length || 0} | Words:{' '}
                    {field.value?.split(/\s+/).filter(Boolean).length || 0}
                  </p>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="metadata.category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., Policy, FAQ, Product Info..."
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="metadata.tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., returns, shipping, billing..."
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    {isEditing ? 'Updating...' : 'Adding...'}
                  </>
                ) : (
                  <>
                    {isEditing ? (
                      <Save className="mr-2 h-4 w-4" />
                    ) : (
                      <Plus className="mr-2 h-4 w-4" />
                    )}
                    {isEditing ? 'Update Document' : 'Add Document'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
