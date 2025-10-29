import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Upload, Send, X } from 'lucide-react';
import { toast } from 'sonner';
import { db } from '@/lib/db';

export function ApplicationForm({ job, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', currentRole: '', experience: '', skills: '', coverLetter: '', resume: null, linkedinUrl: '', portfolioUrl: '', availability: '', salaryExpectation: '', noticePeriod: '', relocation: 'no' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));
  const handleFileChange = (e) => { const file = e.target.files?.[0]; if (file) setFormData((prev) => ({ ...prev, resume: file })); };

  const validateForm = () => {
    const required = ['name', 'email', 'phone', 'currentRole', 'experience', 'coverLetter'];
    const missing = required.filter((field) => !formData[field]);
    if (missing.length > 0) { toast.error(`Please fill in: ${missing.join(', ')}`); return false; }
    if (!formData.email.includes('@')) { toast.error('Please enter a valid email address'); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const candidateId = `candidate-${Date.now()}`;
      const candidate = { id: candidateId, name: formData.name, email: formData.email, phone: formData.phone, stage: 'applied', jobId: job.id, appliedAt: new Date().toISOString() };
      await db.candidates.add(candidate);
      const applicationNote = { id: `note-${Date.now()}`, candidateId, content: `Application Details:\nCurrent Role: ${formData.currentRole}\nExperience: ${formData.experience}\nSkills: ${formData.skills}\nCover Letter: ${formData.coverLetter}\nLinkedIn: ${formData.linkedinUrl || 'Not provided'}\nPortfolio: ${formData.portfolioUrl || 'Not provided'}\nAvailability: ${formData.availability || 'Not specified'}\nSalary Expectation: ${formData.salaryExpectation || 'Not specified'}\nNotice Period: ${formData.noticePeriod || 'Not specified'}\nRelocation: ${formData.relocation}\nResume: ${formData.resume ? formData.resume.name : 'Not uploaded'}`, createdAt: new Date().toISOString(), author: 'System' };
      await db.candidateNotes.add(applicationNote);
      toast.success('Application submitted successfully!');
      onSuccess();
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Apply for {job.title}</CardTitle>
            <div className="mt-2 flex flex-wrap gap-2">
              {job.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
              ))}
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input id="name" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} placeholder="John Doe" required />
              </div>
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input id="email" type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} placeholder="john@example.com" required />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input id="phone" type="tel" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} placeholder="+1 234 567 8900" required />
              </div>
              <div>
                <Label htmlFor="currentRole">Current Role *</Label>
                <Input id="currentRole" value={formData.currentRole} onChange={(e) => handleInputChange('currentRole', e.target.value)} placeholder="Software Engineer" required />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Professional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="experience">Years of Experience *</Label>
                <Select value={formData.experience} onValueChange={(value) => handleInputChange('experience', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-1">0-1 years</SelectItem>
                    <SelectItem value="2-3">2-3 years</SelectItem>
                    <SelectItem value="4-5">4-5 years</SelectItem>
                    <SelectItem value="6-10">6-10 years</SelectItem>
                    <SelectItem value="10+">10+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="skills">Key Skills *</Label>
                <Input id="skills" value={formData.skills} onChange={(e) => handleInputChange('skills', e.target.value)} placeholder="React, TypeScript, Node.js" required />
              </div>
            </div>
            <div>
              <Label htmlFor="coverLetter">Cover Letter *</Label>
              <Textarea id="coverLetter" value={formData.coverLetter} onChange={(e) => handleInputChange('coverLetter', e.target.value)} placeholder="Tell us why you're interested in this position..." className="min-h-[120px]" required />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Additional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="linkedinUrl">LinkedIn Profile</Label>
                <Input id="linkedinUrl" value={formData.linkedinUrl} onChange={(e) => handleInputChange('linkedinUrl', e.target.value)} placeholder="https://linkedin.com/in/yourprofile" />
              </div>
              <div>
                <Label htmlFor="portfolioUrl">Portfolio/GitHub</Label>
                <Input id="portfolioUrl" value={formData.portfolioUrl} onChange={(e) => handleInputChange('portfolioUrl', e.target.value)} placeholder="https://github.com/yourusername" />
              </div>
              <div>
                <Label htmlFor="availability">Availability</Label>
                <Select value={formData.availability} onValueChange={(value) => handleInputChange('availability', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="When can you start?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediately">Immediately</SelectItem>
                    <SelectItem value="2-weeks">2 weeks</SelectItem>
                    <SelectItem value="1-month">1 month</SelectItem>
                    <SelectItem value="2-months">2 months</SelectItem>
                    <SelectItem value="3-months">3+ months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="salaryExpectation">Salary Expectation</Label>
                <Input id="salaryExpectation" value={formData.salaryExpectation} onChange={(e) => handleInputChange('salaryExpectation', e.target.value)} placeholder="$80,000 - $100,000" />
              </div>
              <div>
                <Label htmlFor="noticePeriod">Notice Period</Label>
                <Select value={formData.noticePeriod} onValueChange={(value) => handleInputChange('noticePeriod', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Notice period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No notice required</SelectItem>
                    <SelectItem value="2-weeks">2 weeks</SelectItem>
                    <SelectItem value="1-month">1 month</SelectItem>
                    <SelectItem value="2-months">2 months</SelectItem>
                    <SelectItem value="3-months">3 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="relocation">Open to Relocation</Label>
                <Select value={formData.relocation} onValueChange={(value) => handleInputChange('relocation', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="maybe">Maybe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Resume</h3>
            <div>
              <Label htmlFor="resume">Upload Resume (PDF, DOC, DOCX)</Label>
              <div className="mt-2">
                <Input id="resume" type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90" />
              </div>
              {formData.resume && <p className="text-sm text-muted-foreground mt-2">Selected: {formData.resume.name}</p>}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              <Send className="mr-2 h-4 w-4" />
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}


