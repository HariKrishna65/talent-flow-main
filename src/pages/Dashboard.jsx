import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Users, FileCheck, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const jobs = useLiveQuery(() => db.jobs.toArray()) || [];
  const candidates = useLiveQuery(() => db.candidates.toArray()) || [];
  const assessments = useLiveQuery(() => db.assessments.toArray()) || [];

  const activeJobs = jobs.filter((j) => j.status === 'active').length;
  const totalCandidates = candidates.length;
  const activeCandidates = candidates.filter((c) => !['hired', 'rejected'].includes(c.stage)).length;

  const stats = [
    { title: 'Active Jobs', value: activeJobs, total: jobs.length, icon: Briefcase, color: 'text-primary' },
    { title: 'Total Candidates', value: totalCandidates, icon: Users, color: 'text-accent' },
    { title: 'Active Pipeline', value: activeCandidates, icon: TrendingUp, color: 'text-success' },
    { title: 'Assessments', value: assessments.length, icon: FileCheck, color: 'text-warning' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your hiring pipeline</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.total !== undefined && <p className="text-xs text-muted-foreground">of {stat.total} total</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates across your pipeline</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium">New candidates added</p>
                  <p className="text-sm text-muted-foreground">{candidates.slice(-5).length} new applications today</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="h-9 w-9 rounded-full bg-accent/10 flex items-center justify-center">
                  <Briefcase className="h-4 w-4 text-accent" />
                </div>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium">Active job postings</p>
                  <p className="text-sm text-muted-foreground">{activeJobs} positions currently open</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pipeline Status</CardTitle>
            <CardDescription>Candidates by stage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {['applied', 'screen', 'tech', 'offer'].map((stage) => {
                const count = candidates.filter((c) => c.stage === stage).length;
                const percentage = totalCandidates > 0 ? Math.round((count / totalCandidates) * 100) : 0;
                return (
                  <div key={stage} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="capitalize font-medium">{stage}</span>
                      <span className="text-muted-foreground">{count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


