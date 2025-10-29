import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Upload } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function AssessmentPreview({ sections, onClose, jobTitle }) {
  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState({});

  const updateAnswer = (questionId, value) => {
    setAnswers({ ...answers, [questionId]: value });
    if (errors[questionId]) {
      const newErrors = { ...errors };
      delete newErrors[questionId];
      setErrors(newErrors);
    }
  };

  const shouldShowQuestion = (question) => {
    if (!question.conditionalOn) return true;
    const dependentAnswer = answers[question.conditionalOn.questionId];
    return dependentAnswer === question.conditionalOn.expectedValue;
  };

  const validateAnswer = (question) => {
    const answer = answers[question.id];
    if (question.required && !answer) return 'This field is required';
    if (question.type === 'numeric' && answer) {
      const num = Number(answer);
      if (question.minValue !== undefined && num < question.minValue) return `Value must be at least ${question.minValue}`;
      if (question.maxValue !== undefined && num > question.maxValue) return `Value must be at most ${question.maxValue}`;
    }
    if ((question.type === 'short-text' || question.type === 'long-text') && answer && question.maxLength) {
      if (String(answer).length > question.maxLength) return `Maximum length is ${question.maxLength} characters`;
    }
    return null;
  };

  const handleSubmit = () => {
    const newErrors = {};
    let hasErrors = false;
    sections.forEach((section) => {
      section.questions.forEach((question) => {
        if (shouldShowQuestion(question)) {
          const error = validateAnswer(question);
          if (error) {
            newErrors[question.id] = error;
            hasErrors = true;
          }
        }
      });
    });
    if (hasErrors) {
      setErrors(newErrors);
      toast({ title: 'Validation Error', description: 'Please fix the errors before submitting', variant: 'destructive' });
      return;
    }
    toast({ title: 'Assessment Submitted', description: 'Your responses have been saved (preview mode)' });
  };

  const renderQuestion = (question) => {
    if (!shouldShowQuestion(question)) return null;
    const error = errors[question.id];
    return (
      <div key={question.id} className="space-y-3">
        <Label className="text-base">
          {question.text}
          {question.required && <span className="text-destructive ml-1">*</span>}
        </Label>

        {question.type === 'short-text' && (
          <Input value={answers[question.id] || ''} onChange={(e) => updateAnswer(question.id, e.target.value)} maxLength={question.maxLength} className={error ? 'border-destructive' : ''} />
        )}

        {question.type === 'long-text' && (
          <Textarea value={answers[question.id] || ''} onChange={(e) => updateAnswer(question.id, e.target.value)} maxLength={question.maxLength} className={error ? 'border-destructive' : ''} rows={5} />
        )}

        {question.type === 'numeric' && (
          <Input type="number" value={answers[question.id] || ''} onChange={(e) => updateAnswer(question.id, e.target.value)} min={question.minValue} max={question.maxValue} className={error ? 'border-destructive' : ''} />
        )}

        {question.type === 'single-choice' && question.options && (
          <RadioGroup value={answers[question.id] || ''} onValueChange={(value) => updateAnswer(question.id, value)}>
            {question.options.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                <Label htmlFor={`${question.id}-${option}`} className="font-normal">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}

        {question.type === 'multi-choice' && question.options && (
          <div className="space-y-2">
            {question.options.map((option) => {
              const selected = answers[question.id] || [];
              return (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    checked={selected.includes(option)}
                    onCheckedChange={(checked) => {
                      if (checked) updateAnswer(question.id, [...selected, option]);
                      else updateAnswer(question.id, selected.filter((o) => o !== option));
                    }}
                    id={`${question.id}-${option}`}
                  />
                  <Label htmlFor={`${question.id}-${option}`} className="font-normal">
                    {option}
                  </Label>
                </div>
              );
            })}
          </div>
        )}

        {question.type === 'file-upload' && (
          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-2">Click to upload or drag and drop</p>
            <Button variant="outline" size="sm">Choose File</Button>
            <p className="text-xs text-muted-foreground mt-2">(File upload is a stub in this preview)</p>
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        {question.maxLength && (question.type === 'short-text' || question.type === 'long-text') && (
          <p className="text-xs text-muted-foreground">{(answers[question.id] || '').length} / {question.maxLength} characters</p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assessment Preview</h1>
          <p className="text-muted-foreground">{jobTitle}</p>
        </div>
      </div>

      <Card className="border-primary">
        <CardHeader>
          <CardTitle>Live Preview Mode</CardTitle>
          <CardDescription>This is how candidates will see and interact with your assessment</CardDescription>
        </CardHeader>
      </Card>

      {sections.map((section) => (
        <Card key={section.id}>
          <CardHeader>
            <CardTitle>{section.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">{section.questions.map(renderQuestion)}</CardContent>
        </Card>
      ))}

      <div className="flex gap-4">
        <Button onClick={handleSubmit} className="flex-1">Submit Assessment (Preview)</Button>
        <Button variant="outline" onClick={onClose}>Back to Builder</Button>
      </div>
    </div>
  );
}


