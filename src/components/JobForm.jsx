import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { useState } from 'react';

const jobSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  slug: z.string().trim().min(1, 'Slug is required').max(100, 'Slug must be less than 100 characters').regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase letters, numbers, and hyphens'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  tags: z.array(z.string()).default([]),
});

export function JobForm({ job, onSuccess }) {
  const [tagInput, setTagInput] = useState('');
  const isEdit = !!job;

  const form = useForm({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: job?.title || '',
      slug: job?.slug || '',
      description: job?.description || '',
      tags: job?.tags || [],
    },
  });

  const onSubmit = async (data) => {
    try {
      const existingJobs = await db.jobs.toArray();
      const slugExists = existingJobs.some((j) => j.slug === data.slug && j.id !== job?.id);
      if (slugExists) {
        form.setError('slug', { message: 'This slug already exists. Please use a unique slug.' });
        return;
      }
      if (isEdit) {
        await db.jobs.update(job.id, { ...data, tags: data.tags || [] });
        toast.success('Job updated successfully');
      } else {
        const maxOrder = existingJobs.reduce((max, j) => Math.max(max, j.order), 0);
        await db.jobs.add({ id: `job-${Date.now()}`, title: data.title, slug: data.slug, description: data.description, status: 'active', tags: data.tags || [], order: maxOrder + 1, createdAt: new Date().toISOString() });
        toast.success('Job created successfully');
      }
      onSuccess();
    } catch (error) {
      toast.error(isEdit ? 'Failed to update job' : 'Failed to create job');
    }
  };

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !form.getValues('tags').includes(tag)) {
      form.setValue('tags', [...form.getValues('tags'), tag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    form.setValue('tags', form.getValues('tags').filter((t) => t !== tagToRemove));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="title" render={({ field }) => (
          <FormItem>
            <FormLabel>Title *</FormLabel>
            <FormControl>
              <Input placeholder="e.g., Senior Frontend Developer" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="slug" render={({ field }) => (
          <FormItem>
            <FormLabel>Slug *</FormLabel>
            <FormControl>
              <Input placeholder="e.g., senior-frontend-developer" {...field} onChange={(e) => field.onChange(e.target.value.toLowerCase())} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea placeholder="Job description..." rows={4} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="space-y-2">
          <FormLabel>Tags</FormLabel>
          <div className="flex gap-2">
            <Input placeholder="Add a tag..." value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }} />
            <Button type="button" onClick={handleAddTag} variant="outline">Add</Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {form.watch('tags').map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
                <button type="button" onClick={() => handleRemoveTag(tag)} className="ml-1 hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-4">
          <Button type="submit">{isEdit ? 'Update Job' : 'Create Job'}</Button>
        </div>
      </form>
    </Form>
  );
}


