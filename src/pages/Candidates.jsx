import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Mail, Phone, LayoutGrid, List, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const stages = [
  { id: 'applied', label: 'Applied', color: 'bg-blue-500' },
  { id: 'screen', label: 'Screen', color: 'bg-purple-500' },
  { id: 'tech', label: 'Technical', color: 'bg-orange-500' },
  { id: 'offer', label: 'Offer', color: 'bg-green-500' },
  { id: 'hired', label: 'Hired', color: 'bg-emerald-500' },
  { id: 'rejected', label: 'Rejected', color: 'bg-red-500' },
];

function CandidateCard({ candidate, jobTitle, onClick }) {
  const stage = stages.find((s) => s.id === candidate.stage);
  return (
    <Card className="mb-3 cursor-pointer hover:border-primary transition-colors" onClick={onClick}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base">{candidate.name}</CardTitle>
            {jobTitle && (
              <div className="mt-1">
                <Badge variant="outline" className="text-xs">
                  {jobTitle}
                </Badge>
              </div>
            )}
            <div className="mt-2 space-y-1">
              <div className="flex items-center text-sm text-muted-foreground">
                <Mail className="mr-2 h-3 w-3 flex-shrink-0" />
                <span className="truncate">{candidate.email}</span>
              </div>
              {candidate.phone && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Phone className="mr-2 h-3 w-3 flex-shrink-0" />
                  {candidate.phone}
                </div>
              )}
            </div>
          </div>
          <Badge className={stage?.color}>{stage?.label}</Badge>
        </div>
      </CardHeader>
    </Card>
  );
}

export default function Candidates() {
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [jobFilter, setJobFilter] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const navigate = useNavigate();

  const allCandidates = useLiveQuery(() => db.candidates.toArray()) || [];
  const jobs = useLiveQuery(() => db.jobs.toArray()) || [];

  const filteredCandidates = allCandidates.filter((candidate) => {
    const matchesSearch =
      search === '' || candidate.name.toLowerCase().includes(search.toLowerCase()) || candidate.email.toLowerCase().includes(search.toLowerCase());
    const matchesStage = !stageFilter || candidate.stage === stageFilter;
    const matchesJob = !jobFilter || candidate.jobId === jobFilter;
    return matchesSearch && matchesStage && matchesJob;
  });

  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, stageFilter, jobFilter]);

  const totalPages = Math.ceil(filteredCandidates.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedCandidates = filteredCandidates.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  if (viewMode === 'kanban') {
    navigate('/candidates/kanban');
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Candidates</h1>
          <p className="text-muted-foreground">
            {filteredCandidates.length} candidates in your pipeline
            {totalPages > 1 && ` • Page ${currentPage} of ${totalPages}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('list')}>
            <List className="mr-2 h-4 w-4" />
            List View
          </Button>
          <Button variant="outline" size="sm" onClick={() => setViewMode('kanban')}>
            <LayoutGrid className="mr-2 h-4 w-4" />
            Kanban Board
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search candidates..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Badge variant={!stageFilter ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setStageFilter('')}>
            All Stages
          </Badge>
          {stages.map((stage) => (
            <Badge
              key={stage.id}
              variant={stageFilter === stage.id ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setStageFilter(stage.id)}
            >
              {stage.label}
            </Badge>
          ))}
        </div>

        <div className="flex gap-2 flex-wrap">
          <Badge variant={!jobFilter ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setJobFilter('')}>
            All Jobs
          </Badge>
          {jobs.map((job) => (
            <Badge
              key={job.id}
              variant={jobFilter === job.id ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setJobFilter(job.id)}
            >
              {job.title}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="border rounded-lg bg-card">
          <div className="p-4 space-y-3">
            {paginatedCandidates.length > 0 ? (
              paginatedCandidates.map((candidate) => (
                <CandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  jobTitle={jobs.find((j) => j.id === candidate.jobId)?.title}
                  onClick={() => navigate(`/candidates/${candidate.id}`)}
                />
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>No candidates found matching your criteria</p>
              </div>
            )}
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredCandidates.length)} of {filteredCandidates.length} candidates
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) pageNum = i + 1;
                  else if (currentPage <= 3) pageNum = i + 1;
                  else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                  else pageNum = currentPage - 2 + i;
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => goToPage(pageNum)}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button variant="outline" size="sm" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


