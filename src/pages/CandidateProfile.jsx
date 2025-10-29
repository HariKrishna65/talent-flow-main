import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Mail, Phone, Calendar } from 'lucide-react';
import NotesSection from '@/components/NotesSection';

export default function CandidateProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const candidate = useLiveQuery(() => (id ? db.candidates.get(id) : undefined), [id]);
  const timeline = useLiveQuery(() => (id ? db.candidateTimeline.where('candidateId').equals(id).toArray() : []), [id]);

  if (!candidate) return <div>Loading...</div>;

  const sortedTimeline = (timeline || []).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/candidates')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{candidate.name}</h1>
          <p className="text-muted-foreground">Candidate Profile</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{candidate.email}</span>
            </div>
            {candidate.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{candidate.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Applied: {new Date(candidate.appliedAt).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className="text-base px-4 py-2">{candidate.stage.toUpperCase()}</Badge>
            <p className="mt-4 text-sm text-muted-foreground">Job ID: {candidate.jobId}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
            <CardDescription>Status change history</CardDescription>
          </CardHeader>
          <CardContent>
            {sortedTimeline.length === 0 ? (
              <p className="text-muted-foreground">No timeline events yet</p>
            ) : (
              <div className="space-y-4">
                {sortedTimeline.map((event) => (
                  <div key={event.id} className="flex items-start gap-4 border-l-2 border-primary pl-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{event.fromStage}</Badge>
                        <span className="text-muted-foreground">→</span>
                        <Badge>{event.toStage}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{new Date(event.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <NotesSection candidateId={id} />
      </div>
    </div>
  );
}


