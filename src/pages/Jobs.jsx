import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Archive, ArchiveRestore, GripVertical, ChevronLeft, ChevronRight, Eye, Send } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { JobForm } from '@/components/JobForm';
import { ApplicationForm } from '@/components/ApplicationForm';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from 'sonner';

function SortableJobCard({ job }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: job.id });

  const style = { transform: CSS.Transform.toString(transform), transition };

  const handleArchive = async (e) => {
    e.stopPropagation();
    const newStatus = job.status === 'active' ? 'archived' : 'active';
    await db.jobs.update(job.id, { status: newStatus });
    toast.success(`Job ${newStatus === 'archived' ? 'archived' : 'restored'}`);
  };

  const handleApply = async (e) => {
    e.stopPropagation();
    setIsApplyOpen(true);
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-3">
      <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => navigate(`/jobs/${job.id}`)}>
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <button className="mt-1 cursor-grab active:cursor-grabbing touch-none" onClick={(e) => e.stopPropagation()} {...attributes} {...listeners}>
              <GripVertical className="h-5 w-5 text-muted-foreground" />
            </button>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg">{job.title}</CardTitle>
              <CardDescription className="mt-1">{job.slug}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={job.status === 'active' ? 'default' : 'secondary'}>{job.status}</Badge>
              {user?.role === 'hr' && (
                <Button variant="ghost" size="icon" onClick={handleArchive}>
                  {job.status === 'active' ? <Archive className="h-4 w-4" /> : <ArchiveRestore className="h-4 w-4" />}
                </Button>
              )}
              {user?.role === 'candidate' && job.status === 'active' && (
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/jobs/${job.id}`);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Dialog open={isApplyOpen} onOpenChange={setIsApplyOpen}>
                    <DialogTrigger asChild>
                      <Button variant="default" size="sm" onClick={handleApply}>
                        <Send className="h-4 w-4 mr-1" />
                        Apply
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <ApplicationForm job={job} onSuccess={() => setIsApplyOpen(false)} onCancel={() => setIsApplyOpen(false)} />
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {job.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Jobs() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const pageSize = 10;

  const allJobs = useLiveQuery(() => db.jobs.orderBy('order').toArray()) || [];

  const filteredJobs = allJobs.filter((job) => {
    const matchesSearch =
      search === '' || job.title.toLowerCase().includes(search.toLowerCase()) || job.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredJobs.length / pageSize);
  const paginatedJobs = filteredJobs.slice((page - 1) * pageSize, page * pageSize);

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusChange = (status) => {
    setStatusFilter(status);
    setPage(1);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = paginatedJobs.findIndex((j) => j.id === active.id);
    const newIndex = paginatedJobs.findIndex((j) => j.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const oldOrder = paginatedJobs[oldIndex].order;
    const newOrder = paginatedJobs[newIndex].order;
    try {
      const response = await fetch(`/api/jobs/${active.id}/reorder`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromOrder: oldOrder, toOrder: newOrder }),
      });
      if (!response.ok) throw new Error('Reorder failed');
      toast.success('Job order updated');
    } catch (error) {
      toast.error('Failed to reorder. Changes rolled back.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Jobs</h1>
          <p className="text-muted-foreground">{user?.role === 'hr' ? 'Manage your job postings' : 'Browse available job opportunities'}</p>
        </div>
        {user?.role === 'hr' && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Job
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Job</DialogTitle>
              </DialogHeader>
              <JobForm onSuccess={() => setIsCreateOpen(false)} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search jobs..." value={search} onChange={(e) => handleSearchChange(e.target.value)} className="pl-9" />
        </div>
        {user?.role === 'hr' && (
          <div className="flex gap-2">
            <Button variant={statusFilter === 'all' ? 'default' : 'outline'} onClick={() => handleStatusChange('all')}>
              All
            </Button>
            <Button variant={statusFilter === 'active' ? 'default' : 'outline'} onClick={() => handleStatusChange('active')}>
              Active
            </Button>
            <Button variant={statusFilter === 'archived' ? 'default' : 'outline'} onClick={() => handleStatusChange('archived')}>
              Archived
            </Button>
          </div>
        )}
      </div>

      {user?.role === 'hr' ? (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={paginatedJobs.map((j) => j.id)} strategy={verticalListSortingStrategy}>
            <div>
              {paginatedJobs.map((job) => (
                <SortableJobCard key={job.id} job={job} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div>
          {paginatedJobs.map((job) => (
            <SortableJobCard key={job.id} job={job} />
          ))}
        </div>
      )}

      {filteredJobs.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">No jobs found</p>
          </CardContent>
        </Card>
      )}

      {filteredJobs.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, filteredJobs.length)} of {filteredJobs.length} jobs
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}


