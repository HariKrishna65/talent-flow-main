import { useLiveQuery } from 'dexie-react-hooks';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Assessments() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const jobs = useLiveQuery(() => db.jobs.where('status').equals('active').toArray()) || [];
  const assessments = useLiveQuery(() => db.assessments.toArray()) || [];

  const jobsWithAssessments = jobs.map((job) => ({ ...job, assessment: assessments.find((a) => a.jobId === job.id) }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assessments</h1>
          <p className="text-muted-foreground">{user?.role === 'hr' ? 'Create and manage job assessments' : 'Take assessments for job applications'}</p>
        </div>
        {user?.role === 'hr' && (
          <Button onClick={() => navigate('/assessments/create')}>
            <Plus className="mr-2 h-4 w-4" />
            Create New Assignment
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {jobsWithAssessments.map((job) => (
          <Card key={job.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{job.title}</CardTitle>
                  <CardDescription className="mt-1">
                    {job.assessment ? `${job.assessment.sections.reduce((sum, s) => sum + s.questions.length, 0)} questions` : 'No assessment yet'}
                  </CardDescription>
                </div>
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {job.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              {job.assessment && job.assessment.sections.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Questions:</h4>
                  <div className="space-y-2">
                    {job.assessment.sections[0].questions.slice(0, 3).map((question, index) => (
                      <div key={question.id} className="text-xs text-muted-foreground">
                        <span className="font-medium">{index + 1}.</span> {question.text.length > 60 ? `${question.text.substring(0, 60)}...` : question.text}
                      </div>
                    ))}
                    {job.assessment.sections[0].questions.length > 3 && (
                      <div className="text-xs text-muted-foreground italic">
                        +{job.assessment.sections[0].questions.length - 3} more questions
                      </div>
                    )}
                  </div>
                </div>
              )}
              {user?.role === 'hr' ? (
                job.assessment ? (
                  <Button className="w-full" variant="outline" onClick={() => navigate(`/assessments/${job.id}/builder`)}>
                    Edit Assessment
                  </Button>
                ) : (
                  <div className="text-center text-sm text-muted-foreground">Assessment not created yet</div>
                )
              ) : (
                <Button
                  className="w-full"
                  variant={job.assessment ? 'default' : 'secondary'}
                  disabled={!job.assessment}
                  onClick={() => {
                    if (job.assessment) navigate(`/assessments/${job.id}/attempt`);
                  }}
                >
                  <Play className="h-4 w-4 mr-2" />
                  {job.assessment ? 'Attempt Assessment' : 'No Assessment Available'}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {jobsWithAssessments.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">{user?.role === 'hr' ? 'No active jobs found' : 'No assessments available'}</p>
            {user?.role === 'hr' && (
              <Button onClick={() => navigate('/jobs')}>
                <Plus className="mr-2 h-4 w-4" />
                Create Job First
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}


