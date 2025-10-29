import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

export default function AssessmentBuilder() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const job = useLiveQuery(() => (jobId ? db.jobs.get(jobId) : undefined), [jobId]);
  const existingAssessment = useLiveQuery(() => (jobId ? db.assessments.where('jobId').equals(jobId).first() : undefined), [jobId]);

  const [sections, setSections] = useState(
    existingAssessment?.sections || [
      { id: `section-${Date.now()}`, title: 'General Questions', questions: [] },
    ],
  );
  const [showPreview, setShowPreview] = useState(false);

  const addSection = () => {
    setSections([...sections, { id: `section-${Date.now()}`, title: 'New Section', questions: [] }]);
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
        if (s.id === sectionId) {
          return { ...s, questions: [...s.questions, { id: `q-${Date.now()}`, type: 'short-text', text: 'New Question', required: false }] };
        }
        return s;
      }),
    );
  };

  const updateQuestion = (sectionId, questionId, updates) => {
    setSections(
      sections.map((s) => {
        if (s.id === sectionId) {
          return { ...s, questions: s.questions.map((q) => (q.id === questionId ? { ...q, ...updates } : q)) };
        }
        return s;
      }),
    );
  };

  const deleteQuestion = (sectionId, questionId) => {
    setSections(
      sections.map((s) => {
        if (s.id === sectionId) {
          return { ...s, questions: s.questions.filter((q) => q.id !== questionId) };
        }
        return s;
      }),
    );
  };

  const handleSave = async () => {
    if (!jobId) return;
    try {
      if (existingAssessment) {
        await db.assessments.update(existingAssessment.id, { sections });
      } else {
        await db.assessments.add({ id: `assessment-${Date.now()}`, jobId, sections, createdAt: new Date().toISOString() });
      }
      toast({ title: 'Assessment Saved', description: 'Your assessment has been saved successfully' });
      navigate('/assessments');
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save assessment', variant: 'destructive' });
    }
  };

  const allQuestions = sections.flatMap((s) => s.questions);

  if (!job) return <div>Loading...</div>;
  if (showPreview) {
    return <AssessmentPreview sections={sections} onClose={() => setShowPreview(false)} jobTitle={job.title} />;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/assessments')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Assessment Builder</h1>
            <p className="text-muted-foreground">{job.title}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowPreview(true)}>
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save Assessment
          </Button>
        </div>
      </div>

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
                        <Input
                          value={question.options?.join(', ') || ''}
                          onChange={(e) => updateQuestion(section.id, question.id, { options: e.target.value.split(',').map((o) => o.trim()).filter(Boolean) })}
                          placeholder="Yes, No, Maybe"
                          className="mt-2"
                        />
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

                    {(question.type === 'short-text' || question.type === 'long-text') && (
                      <div>
                        <Label>Max Length</Label>
                        <Input type="number" value={question.maxLength || ''} onChange={(e) => updateQuestion(section.id, question.id, { maxLength: Number(e.target.value) })} placeholder="Optional" className="mt-2" />
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
                          {allQuestions
                            .filter((q) => q.id !== question.id)
                            .map((q, idx) => (
                              <SelectItem key={q.id} value={q.id}>
                                Question {idx + 1}: {q.text.substring(0, 30)}...
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      {question.conditionalOn && (
                        <Input
                          value={question.conditionalOn.expectedValue}
                          onChange={(e) => updateQuestion(section.id, question.id, { conditionalOn: { ...question.conditionalOn, expectedValue: e.target.value } })}
                          placeholder="Expected answer"
                          className="mt-2"
                        />
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
    </div>
  );
}


