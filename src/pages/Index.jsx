import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Briefcase, Users, FileCheck, TrendingUp, Building2, Clock, MapPin, DollarSign } from 'lucide-react';
import heroBackground from '@/assets/hero-background.jpg';

const Index = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/jobs');
    }
  }, [isAuthenticated, user, navigate]);

  const handleLogin = (role) => {
    login(email, password, role);
  };

  const stats = [
    { title: 'Active Jobs', value: '12', icon: Briefcase, color: 'text-primary' },
    { title: 'Total Candidates', value: '248', icon: Users, color: 'text-accent' },
    { title: 'Active Pipeline', value: '156', icon: TrendingUp, color: 'text-success' },
    { title: 'Assessments', value: '8', icon: FileCheck, color: 'text-warning' },
  ];

  const featuredJobs = [
    { id: '1', title: 'Senior Frontend Developer', company: 'TechCorp Inc.', location: 'San Francisco, CA', salary: '$120k - $150k', deadline: '2 days left', type: 'Full-time', tags: ['React', 'TypeScript', 'Remote'] },
    { id: '2', title: 'Full Stack Engineer', company: 'StartupXYZ', location: 'New York, NY', salary: '$100k - $130k', deadline: '5 days left', type: 'Full-time', tags: ['Node.js', 'React', 'AWS'] },
    { id: '3', title: 'UI/UX Designer', company: 'DesignStudio', location: 'Los Angeles, CA', salary: '$80k - $110k', deadline: '1 week left', type: 'Full-time', tags: ['Figma', 'Sketch', 'Adobe'] },
    { id: '4', title: 'DevOps Engineer', company: 'CloudTech', location: 'Austin, TX', salary: '$110k - $140k', deadline: '3 days left', type: 'Full-time', tags: ['Docker', 'Kubernetes', 'AWS'] },
    { id: '5', title: 'Product Manager', company: 'InnovateCorp', location: 'Seattle, WA', salary: '$130k - $160k', deadline: '1 week left', type: 'Full-time', tags: ['Agile', 'Scrum', 'Analytics'] },
  ];

  return (
    <div className="min-h-screen relative">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBackground})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/70 via-accent/60 to-primary/70" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        <header className="p-6">
          <div className="flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary-foreground" />
            <h1 className="text-2xl font-bold text-primary-foreground">TalentFlow</h1>
          </div>
        </header>

        <div className="flex-1 container mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-3 gap-12 items-start">
            <div className="lg:col-span-1 space-y-8 animate-fade-in">
              <div>
                <h2 className="text-5xl font-bold text-primary-foreground mb-4">Streamline Your Hiring Process</h2>
                <p className="text-xl text-primary-foreground/90">Manage jobs, candidates, and assessments all in one place</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat) => (
                  <Card key={stat.title} className="bg-card/95 backdrop-blur">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                      <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stat.value}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="lg:col-span-1 space-y-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div>
                <h3 className="text-2xl font-bold text-primary-foreground mb-2">Featured Jobs</h3>
                <p className="text-primary-foreground/80">Latest opportunities with deadlines</p>
              </div>

              <ScrollArea className="h-96">
                <div className="space-y-4 pr-4">
                  {featuredJobs.map((job) => (
                    <Card key={job.id} className="bg-gradient-to-br from-blue-500/20 to-purple-600/20 backdrop-blur-sm border-blue-400/30 hover:from-blue-500/30 hover:to-purple-600/30 hover:border-blue-400/50 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg text-white font-semibold">{job.title}</CardTitle>
                            <CardDescription className="text-white/90 font-medium">{job.company}</CardDescription>
                          </div>
                          <Badge variant="secondary" className="bg-orange-500/90 text-white border-orange-400/50 font-semibold">
                            {job.deadline}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-4 text-sm text-white/90">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-blue-300" />
                            {job.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4 text-green-300" />
                            {job.salary}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {job.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs bg-white/20 border-white/30 text-white hover:bg-white/30 transition-colors">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div className="lg:col-span-1 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <Card className="bg-card/95 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-2xl">Welcome Back</CardTitle>
                  <CardDescription>Sign in to access your account</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="hr" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="hr">HR Login</TabsTrigger>
                      <TabsTrigger value="candidate">Candidate Login</TabsTrigger>
                    </TabsList>

                    <TabsContent value="hr" className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="hr-email">Email</Label>
                        <Input id="hr-email" type="email" placeholder="hr@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hr-password">Password</Label>
                        <Input id="hr-password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                      </div>
                      <Button className="w-full" onClick={() => handleLogin('hr')}>Sign In as HR</Button>
                      <p className="text-sm text-muted-foreground text-center">Access jobs, candidates, and create assessments</p>
                    </TabsContent>

                    <TabsContent value="candidate" className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="candidate-email">Email</Label>
                        <Input id="candidate-email" type="email" placeholder="candidate@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="candidate-password">Password</Label>
                        <Input id="candidate-password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                      </div>
                      <Button className="w-full" onClick={() => handleLogin('candidate')}>Sign In as Candidate</Button>
                      <p className="text-sm text-muted-foreground text-center">View jobs and attempt assessments</p>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;


