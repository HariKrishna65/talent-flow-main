import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Plus, Trash2, Eye, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import AssessmentPreview from '@/components/AssessmentPreview';

export default function CreateAssignment() {
  const navigate = useNavigate();
  const jobs = useLiveQuery(() => db.jobs.where('status').equals('active').toArray()) || [];

  const [selectedJobId, setSelectedJobId] = useState('');
  const [sections, setSections] = useState([
    { id: `section-${Date.now()}`, title: 'Job-Related Questions', questions: [] },
  ]);
  const [showPreview, setShowPreview] = useState(false);

  const selectedJob = jobs.find((job) => job.id === selectedJobId);

  const generateJobRelatedQuestions = (job) => {
    const questions = [];
    if (job.tags.length > 0) {
      questions.push({ id: `q-${Date.now()}-1`, type: 'multi-choice', text: `Which of the following technologies from this ${job.title} role are you proficient in?`, required: true, options: job.tags });
    }
    questions.push({ id: `q-${Date.now()}-2`, type: 'single-choice', text: `How many years of experience do you have in ${job.title.toLowerCase()}?`, required: true, options: ['0-1 years', '2-3 years', '4-5 years', '6-10 years', '10+ years'] });
    questions.push({ id: `q-${Date.now()}-3`, type: 'long-text', text: `Describe a challenging project you worked on that relates to ${job.title.toLowerCase()}. What was your role and what technologies did you use?`, required: true, maxLength: 1000 });
    questions.push({ id: `q-${Date.now()}-4`, type: 'long-text', text: `How would you approach solving a complex technical problem in a ${job.title.toLowerCase()} role? Walk us through your thought process.`, required: true, maxLength: 800 });
    questions.push({ id: `q-${Date.now()}-5`, type: 'long-text', text: `What interests you most about this ${job.title} position? How do you see yourself contributing to our team?`, required: true, maxLength: 500 });
    return questions;
  };

  const handleJobSelection = (jobId) => {
    setSelectedJobId(jobId);
    const job = jobs.find((j) => j.id === jobId);
    if (job) {
      const jobQuestions = generateJobRelatedQuestions(job);
      setSections([{ id: `section-${Date.now()}`, title: `${job.title} - Assessment Questions`, questions: jobQuestions }]);
    }
  };

  const addSection = () => {
    setSections([...sections, { id: `section-${Date.now()}`, title: 'Additional Section', questions: [] }]);
  };

  const updateSection = (sectionId, title) => {
    setSections(sections.map((s) => (s.id === sectionId ? { ...s, title } : s)));
  };

  const deleteSection = (sectionId) => {
    setSections(sections.filter((s) => s.id !== sectionId));
  };

  const addQuestion = (sectionId) => {
    setSections(
      sections.map((s) => {
        if (s.id === sectionId) return { ...s, questions: [...s.questions, { id: `q-${Date.now()}`, type: 'short-text', text: 'New Question', required: false }] };
        return s;
      }),
    );
  };

  const updateQuestion = (sectionId, questionId, updates) => {
    setSections(
      sections.map((s) => {
        if (s.id === sectionId) return { ...s, questions: s.questions.map((q) => (q.id === questionId ? { ...q, ...updates } : q)) };
        return s;
      }),
    );
  };

  const deleteQuestion = (sectionId, questionId) => {
    setSections(
      sections.map((s) => {
        if (s.id === sectionId) return { ...s, questions: s.questions.filter((q) => q.id !== questionId) };
        return s;
      }),
    );
  };

  const handleSave = async () => {
    if (!selectedJobId) {
      toast({ title: 'Error', description: 'Please select a job first', variant: 'destructive' });
      return;
    }
    try {
      const existingAssessment = await db.assessments.where('jobId').equals(selectedJobId).first();
      if (existingAssessment) {
        await db.assessments.update(existingAssessment.id, { sections });
      } else {
        await db.assessments.add({ id: `assessment-${Date.now()}`, jobId: selectedJobId, sections, createdAt: new Date().toISOString() });
      }
      toast({ title: 'Assessment Created', description: 'Your assessment has been created successfully' });
      navigate('/assessments');
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create assessment', variant: 'destructive' });
    }
  };

  const allQuestions = sections.flatMap((s) => s.questions);

  if (showPreview && selectedJob) {
    return <AssessmentPreview sections={sections} onClose={() => setShowPreview(false)} jobTitle={selectedJob.title} />;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/assessments')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create New Assignment</h1>
            <p className="text-muted-foreground">Create a new assessment for a job position</p>
          </div>
        </div>
        <div className="flex gap-2">
          {selectedJob && (
            <Button variant="outline" onClick={() => setShowPreview(true)}>
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
          )}
          <Button onClick={handleSave} disabled={!selectedJobId}>
            <Save className="mr-2 h-4 w-4" />
            Create Assessment
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Job Position</CardTitle>
          <CardDescription>Choose the job position for which you want to create an assessment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Label>Job Position</Label>
            <Select value={selectedJobId} onValueChange={handleJobSelection}>
              <SelectTrigger>
                <SelectValue placeholder="Select a job position" />
              </SelectTrigger>
              <SelectContent>
                {jobs.map((job) => (
                  <SelectItem key={job.id} value={job.id}>
                    {job.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedJob && (
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold">{selectedJob.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">{selectedJob.description}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedJob.tags.map((tag) => (
                    <span key={tag} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedJobId && (
        <>
          {sections.map((section) => (
            <Card key={section.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Input value={section.title} onChange={(e) => updateSection(section.id, e.target.value)} className="text-xl font-bold border-none p-0 h-auto" />
                  <Button variant="ghost" size="icon" onClick={() => deleteSection(section.id)} disabled={sections.length === 1}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {section.questions.map((question, qIndex) => (
                  <div key={question.id} className="space-y-4 p-4 border rounded-lg">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-4">
                        <div>
                          <Label>Question {qIndex + 1}</Label>
                          <Textarea value={question.text} onChange={(e) => updateQuestion(section.id, question.id, { text: e.target.value })} className="mt-2" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Question Type</Label>
                            <Select value={question.type} onValueChange={(value) => updateQuestion(section.id, question.id, { type: value })}>
                              <SelectTrigger className="mt-2">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="short-text">Short Text</SelectItem>
                                <SelectItem value="long-text">Long Text</SelectItem>
                                <SelectItem value="single-choice">Single Choice</SelectItem>
                                <SelectItem value="multi-choice">Multiple Choice</SelectItem>
                                <SelectItem value="numeric">Numeric</SelectItem>
                                <SelectItem value="file-upload">File Upload</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center gap-2 mt-8">
                            <Switch checked={question.required} onCheckedChange={(checked) => updateQuestion(section.id, question.id, { required: checked })} />
                            <Label>Required</Label>
                          </div>
                        </div>
                        {(question.type === 'single-choice' || question.type === 'multi-choice') && (
                          <div>
                            <Label>Options (comma-separated)</Label>
                            <Input value={question.options?.join(', ') || ''} onChange={(e) => updateQuestion(section.id, question.id, { options: e.target.value.split(',').map((o) => o.trim()).filter(Boolean) })} placeholder="Yes, No, Maybe" className="mt-2" />
                          </div>
                        )}
                        {question.type === 'numeric' && (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Min Value</Label>
                              <Input type="number" value={question.minValue || ''} onChange={(e) => updateQuestion(section.id, question.id, { minValue: Number(e.target.value) })} className="mt-2" />
                            </div>
                            <div>
                              <Label>Max Value</Label>
                              <Input type="number" value={question.maxValue || ''} onChange={(e) => updateQuestion(section.id, question.id, { maxValue: Number(e.target.value) })} className="mt-2" />
                            </div>
                          </div>
                        )}
                        <div>
                          <Label>Conditional Display (optional)</Label>
                          <Select
                            value={question.conditionalOn?.questionId || 'none'}
                            onValueChange={(value) => {
                              if (value === 'none') updateQuestion(section.id, question.id, { conditionalOn: undefined });
                              else updateQuestion(section.id, question.id, { conditionalOn: { questionId: value, expectedValue: '' } });
                            }}
                          >
                            <SelectTrigger className="mt-2">
                              <SelectValue placeholder="Show this question based on..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Always show</SelectItem>
                              {allQuestions.filter((q) => q.id !== question.id).map((q, idx) => (
                                <SelectItem key={q.id} value={q.id}>
                                  Question {idx + 1}: {q.text.substring(0, 30)}...
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {question.conditionalOn && (
                            <Input value={question.conditionalOn.expectedValue} onChange={(e) => updateQuestion(section.id, question.id, { conditionalOn: { ...question.conditionalOn, expectedValue: e.target.value } })} placeholder="Expected answer" className="mt-2" />
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => deleteQuestion(section.id, question.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button variant="outline" onClick={() => addQuestion(section.id)} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Question
                </Button>
              </CardContent>
            </Card>
          ))}
          <Button onClick={addSection} variant="outline" className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Section
          </Button>
        </>
      )}
    </div>
  );
}


