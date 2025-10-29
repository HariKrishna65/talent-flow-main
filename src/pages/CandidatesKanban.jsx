import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Mail, Phone, Plus } from 'lucide-react';
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors, useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

const stages = [
  { id: 'applied', label: 'Applied', color: 'bg-blue-500' },
  { id: 'screen', label: 'Screen', color: 'bg-purple-500' },
  { id: 'tech', label: 'Technical', color: 'bg-orange-500' },
  { id: 'offer', label: 'Offer', color: 'bg-green-500' },
  { id: 'hired', label: 'Hired', color: 'bg-emerald-500' },
  { id: 'rejected', label: 'Rejected', color: 'bg-red-500' },
];

function SortableCandidate({ candidate, jobTitle, onClick }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: candidate.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card className="mb-2 cursor-move hover:border-primary transition-colors" onClick={(e) => { e.stopPropagation(); onClick(); }}>
        <CardContent className="p-3">
          <p className="font-medium text-sm">{candidate.name}</p>
          {jobTitle && (
            <Badge variant="outline" className="mt-1 text-xs">
              {jobTitle}
            </Badge>
          )}
          <div className="mt-1 flex items-center text-xs text-muted-foreground">
            <Mail className="mr-1 h-3 w-3 flex-shrink-0" />
            <span className="truncate">{candidate.email}</span>
          </div>
          {candidate.phone && (
            <div className="mt-1 flex items-center text-xs text-muted-foreground">
              <Phone className="mr-1 h-3 w-3" />
              {candidate.phone}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DroppableStage({ stage, candidates, jobs, onCandidateClick }) {
  const { setNodeRef } = useDroppable({ id: stage.id });
  return (
    <div ref={setNodeRef} className="min-h-[500px]">
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">{stage.label}</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {candidates.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {candidates.map((candidate) => (
              <SortableCandidate key={candidate.id} candidate={candidate} jobTitle={jobs.find((j) => j.id === candidate.jobId)?.title} onClick={() => onCandidateClick(candidate.id)} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CandidatesKanban() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCandidate, setNewCandidate] = useState({ name: '', email: '', phone: '', stage: 'applied', jobId: '' });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const allCandidates = useLiveQuery(() => db.candidates.toArray()) || [];
  const jobs = useLiveQuery(() => db.jobs.toArray()) || [];

  const filteredCandidates = allCandidates.filter((candidate) => {
    const matchesSearch = search === '' || candidate.name.toLowerCase().includes(search.toLowerCase()) || candidate.email.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const candidatesByStage = stages.reduce((acc, stage) => {
    acc[stage.id] = filteredCandidates.filter((c) => c.stage === stage.id);
    return acc;
  }, {});

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;
    const candidateId = active.id;
    const candidate = allCandidates.find((c) => c.id === candidateId);
    if (!candidate) return;
    let newStage;
    const isStage = stages.some((s) => s.id === over.id);
    if (isStage) newStage = over.id;
    else {
      const targetCandidate = allCandidates.find((c) => c.id === over.id);
      if (!targetCandidate) return;
      newStage = targetCandidate.stage;
    }
    if (candidate.stage === newStage) return;
    const oldStage = candidate.stage;
    try {
      await db.candidates.update(candidateId, { stage: newStage });
      await db.candidateTimeline.add({ id: `timeline-${Date.now()}-${Math.random()}`, candidateId, fromStage: oldStage, toStage: newStage, timestamp: new Date().toISOString() });
      const stageName = stages.find((s) => s.id === newStage)?.label || newStage;
      toast({ title: 'Stage Updated', description: `Moved ${candidate.name} to ${stageName}` });
    } catch (error) {
      await db.candidates.update(candidateId, { stage: oldStage });
      toast({ title: 'Error', description: 'Failed to update candidate stage', variant: 'destructive' });
    }
  };

  const handleCreateCandidate = async () => {
    if (!newCandidate.name || !newCandidate.email || !newCandidate.jobId) {
      toast({ title: 'Validation Error', description: 'Name, email, and job are required', variant: 'destructive' });
      return;
    }
    try {
      const candidateId = `candidate-${Date.now()}`;
      await db.candidates.add({ id: candidateId, name: newCandidate.name, email: newCandidate.email, phone: newCandidate.phone, stage: newCandidate.stage, jobId: newCandidate.jobId, appliedAt: new Date().toISOString() });
      toast({ title: 'Candidate Added', description: `${newCandidate.name} has been added to ${stages.find((s) => s.id === newCandidate.stage)?.label}` });
      setNewCandidate({ name: '', email: '', phone: '', stage: 'applied', jobId: '' });
      setIsDialogOpen(false);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create candidate', variant: 'destructive' });
    }
  };

  const activeCand = activeId ? allCandidates.find((c) => c.id === activeId) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Candidate Pipeline</h1>
          <p className="text-muted-foreground">Drag candidates between stages</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Candidate
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Candidate</DialogTitle>
              <DialogDescription>Create a new candidate and assign them to a stage</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input id="name" value={newCandidate.name} onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })} placeholder="John Doe" />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" value={newCandidate.email} onChange={(e) => setNewCandidate({ ...newCandidate, email: e.target.value })} placeholder="john@example.com" />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" type="tel" value={newCandidate.phone} onChange={(e) => setNewCandidate({ ...newCandidate, phone: e.target.value })} placeholder="+1 234 567 8900" />
              </div>
              <div>
                <Label htmlFor="job">Job *</Label>
                <Select value={newCandidate.jobId} onValueChange={(value) => setNewCandidate({ ...newCandidate, jobId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a job" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobs.map((job) => (
                      <SelectItem key={job.id} value={job.id}>
                        {job.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="stage">Initial Stage</Label>
                <Select value={newCandidate.stage} onValueChange={(value) => setNewCandidate({ ...newCandidate, stage: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {stages.map((stage) => (
                      <SelectItem key={stage.id} value={stage.id}>
                        {stage.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreateCandidate} className="w-full">Create Candidate</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search candidates..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {stages.map((stage) => (
            <SortableContext key={stage.id} id={stage.id} items={candidatesByStage[stage.id]?.map((c) => c.id) || []} strategy={verticalListSortingStrategy}>
              <DroppableStage stage={stage} candidates={candidatesByStage[stage.id] || []} jobs={jobs} onCandidateClick={(id) => navigate(`/candidates/${id}`)} />
            </SortableContext>
          ))}
        </div>
        <DragOverlay>
          {activeCand ? (
            <Card className="cursor-move shadow-lg">
              <CardContent className="p-3">
                <p className="font-medium text-sm">{activeCand.name}</p>
                {jobs.find((j) => j.id === activeCand.jobId)?.title && <Badge variant="outline" className="mt-1 text-xs">{jobs.find((j) => j.id === activeCand.jobId)?.title}</Badge>}
                <div className="mt-1 flex items-center text-xs text-muted-foreground">
                  <Mail className="mr-1 h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{activeCand.email}</span>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}


