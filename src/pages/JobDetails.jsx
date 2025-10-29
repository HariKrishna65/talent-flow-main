import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Archive, ArchiveRestore, Send } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { JobForm } from '@/components/JobForm';
import { ApplicationForm } from '@/components/ApplicationForm';
import { toast } from 'sonner';
import { useState } from 'react';

export default function JobDetails() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isApplyOpen, setIsApplyOpen] = useState(false);

  const job = useLiveQuery(() => (jobId ? db.jobs.get(jobId) : undefined), [jobId]);
  const candidates = useLiveQuery(() => (jobId ? db.candidates.where('jobId').equals(jobId).toArray() : []), [jobId]);

  if (!job) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/jobs')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Jobs
        </Button>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">Job not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleArchive = async () => {
    const newStatus = job.status === 'active' ? 'archived' : 'active';
    await db.jobs.update(job.id, { status: newStatus });
    toast.success(`Job ${newStatus === 'archived' ? 'archived' : 'restored'}`);
  };

  const candidatesByStage = {
    applied: candidates?.filter((c) => c.stage === 'applied').length || 0,
    screen: candidates?.filter((c) => c.stage === 'screen').length || 0,
    tech: candidates?.filter((c) => c.stage === 'tech').length || 0,
    offer: candidates?.filter((c) => c.stage === 'offer').length || 0,
    hired: candidates?.filter((c) => c.stage === 'hired').length || 0,
    rejected: candidates?.filter((c) => c.stage === 'rejected').length || 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/jobs')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Jobs
        </Button>
        <div className="flex gap-2">
          {user?.role === 'hr' ? (
            <>
              <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Edit Job</DialogTitle>
                  </DialogHeader>
                  <JobForm job={job} onSuccess={() => setIsEditOpen(false)} />
                </DialogContent>
              </Dialog>
              <Button variant="outline" onClick={handleArchive}>
                {job.status === 'active' ? (
                  <>
                    <Archive className="mr-2 h-4 w-4" />
                    Archive
                  </>
                ) : (
                  <>
                    <ArchiveRestore className="mr-2 h-4 w-4" />
                    Restore
                  </>
                )}
              </Button>
            </>
          ) : (
            user?.role === 'candidate' && job.status === 'active' && (
              <Dialog open={isApplyOpen} onOpenChange={setIsApplyOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Send className="mr-2 h-4 w-4" />
                    Apply Now
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <ApplicationForm job={job} onSuccess={() => setIsApplyOpen(false)} onCancel={() => setIsApplyOpen(false)} />
                </DialogContent>
              </Dialog>
            )
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold tracking-tight">{job.title}</h1>
          <Badge variant={job.status === 'active' ? 'default' : 'secondary'}>{job.status}</Badge>
        </div>
        <p className="text-muted-foreground">/{job.slug}</p>
      </div>

      {job.description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{job.description}</p>
          </CardContent>
        </Card>
      )}

      {job.tags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
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
      )}

      <Card>
        <CardHeader>
          <CardTitle>Candidates</CardTitle>
          <CardDescription>{candidates?.length || 0} total candidates for this position</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Applied</p>
              <p className="text-2xl font-bold">{candidatesByStage.applied}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Screening</p>
              <p className="text-2xl font-bold">{candidatesByStage.screen}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Technical</p>
              <p className="text-2xl font-bold">{candidatesByStage.tech}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Offer</p>
              <p className="text-2xl font-bold">{candidatesByStage.offer}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Hired</p>
              <p className="text-2xl font-bold">{candidatesByStage.hired}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Rejected</p>
              <p className="text-2xl font-bold">{candidatesByStage.rejected}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


