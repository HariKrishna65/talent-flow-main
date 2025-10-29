import { http, HttpResponse, delay } from 'msw';
import { setupWorker } from 'msw/browser';
import { db } from './db';

const BASE_URL = '/api';

async function simulateNetwork() {
  await delay(Math.random() * 1000 + 200);
  if (Math.random() < 0.05) {
    throw new Error('Network error');
  }
}

export const handlers = [
  http.get(`${BASE_URL}/jobs`, async ({ request }) => {
    try {
      await simulateNetwork();
      const url = new URL(request.url);
      const search = url.searchParams.get('search') || '';
      const status = url.searchParams.get('status') || '';
      const page = parseInt(url.searchParams.get('page') || '1');
      const pageSize = parseInt(url.searchParams.get('pageSize') || '10');

      let jobs = await db.jobs.toArray();

      if (search) {
        jobs = jobs.filter((job) => job.title.toLowerCase().includes(search.toLowerCase()) || job.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase())));
      }
      if (status) {
        jobs = jobs.filter((job) => job.status === status);
      }

      jobs.sort((a, b) => a.order - b.order);

      const total = jobs.length;
      const start = (page - 1) * pageSize;
      const paginatedJobs = jobs.slice(start, start + pageSize);

      return HttpResponse.json({ data: paginatedJobs, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
    } catch (error) {
      return HttpResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
    }
  }),

  http.post(`${BASE_URL}/jobs`, async ({ request }) => {
    try {
      await simulateNetwork();
      const job = await request.json();
      await db.jobs.add(job);
      return HttpResponse.json(job, { status: 201 });
    } catch (error) {
      return HttpResponse.json({ error: 'Failed to create job' }, { status: 500 });
    }
  }),

  http.patch(`${BASE_URL}/jobs/:id`, async ({ params, request }) => {
    try {
      await simulateNetwork();
      const updates = await request.json();
      await db.jobs.update(params.id, updates);
      const job = await db.jobs.get(params.id);
      return HttpResponse.json(job);
    } catch (error) {
      return HttpResponse.json({ error: 'Failed to update job' }, { status: 500 });
    }
  }),

  http.patch(`${BASE_URL}/jobs/:id/reorder`, async ({ params, request }) => {
    try {
      await simulateNetwork();
      if (Math.random() < 0.1) {
        return HttpResponse.json({ error: 'Reorder failed' }, { status: 500 });
      }

      const { fromOrder, toOrder } = await request.json();
      const jobs = await db.jobs.orderBy('order').toArray();

      const job = jobs.find((j) => j.order === fromOrder);
      if (!job) {
        return HttpResponse.json({ error: 'Job not found' }, { status: 404 });
      }

      if (fromOrder < toOrder) {
        for (const j of jobs) {
          if (j.order > fromOrder && j.order <= toOrder) {
            await db.jobs.update(j.id, { order: j.order - 1 });
          }
        }
      } else {
        for (const j of jobs) {
          if (j.order >= toOrder && j.order < fromOrder) {
            await db.jobs.update(j.id, { order: j.order + 1 });
          }
        }
      }

      await db.jobs.update(job.id, { order: toOrder });

      return HttpResponse.json({ success: true });
    } catch (error) {
      return HttpResponse.json({ error: 'Failed to reorder job' }, { status: 500 });
    }
  }),

  http.get(`${BASE_URL}/candidates`, async ({ request }) => {
    try {
      await simulateNetwork();
      const url = new URL(request.url);
      const search = url.searchParams.get('search') || '';
      const stage = url.searchParams.get('stage') || '';
      const page = parseInt(url.searchParams.get('page') || '1');
      const pageSize = parseInt(url.searchParams.get('pageSize') || '50');

      let candidates = await db.candidates.toArray();

      if (search) {
        candidates = candidates.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()));
      }
      if (stage) {
        candidates = candidates.filter((c) => c.stage === stage);
      }

      const total = candidates.length;
      const start = (page - 1) * pageSize;
      const paginatedCandidates = candidates.slice(start, start + pageSize);

      return HttpResponse.json({ data: paginatedCandidates, total, page, pageSize });
    } catch (error) {
      return HttpResponse.json({ error: 'Failed to fetch candidates' }, { status: 500 });
    }
  }),

  http.post(`${BASE_URL}/candidates`, async ({ request }) => {
    try {
      await simulateNetwork();
      const candidate = await request.json();
      await db.candidates.add(candidate);
      return HttpResponse.json(candidate, { status: 201 });
    } catch (error) {
      return HttpResponse.json({ error: 'Failed to create candidate' }, { status: 500 });
    }
  }),

  http.patch(`${BASE_URL}/candidates/:id`, async ({ params, request }) => {
    try {
      await simulateNetwork();
      const updates = await request.json();

      if (updates.stage) {
        const candidate = await db.candidates.get(params.id);
        if (candidate) {
          await db.candidateTimeline.add({
            id: `timeline-${Date.now()}`,
            candidateId: params.id,
            fromStage: candidate.stage,
            toStage: updates.stage,
            timestamp: new Date().toISOString(),
          });
        }
      }

      await db.candidates.update(params.id, updates);
      const candidate = await db.candidates.get(params.id);
      return HttpResponse.json(candidate);
    } catch (error) {
      return HttpResponse.json({ error: 'Failed to update candidate' }, { status: 500 });
    }
  }),

  http.get(`${BASE_URL}/candidates/:id/timeline`, async ({ params }) => {
    try {
      await simulateNetwork();
      const timeline = await db.candidateTimeline.where('candidateId').equals(params.id).toArray();
      return HttpResponse.json(timeline);
    } catch (error) {
      return HttpResponse.json({ error: 'Failed to fetch timeline' }, { status: 500 });
    }
  }),

  http.get(`${BASE_URL}/assessments/:jobId`, async ({ params }) => {
    try {
      await simulateNetwork();
      const assessment = await db.assessments.where('jobId').equals(params.jobId).first();
      return HttpResponse.json(assessment || null);
    } catch (error) {
      return HttpResponse.json({ error: 'Failed to fetch assessment' }, { status: 500 });
    }
  }),

  http.put(`${BASE_URL}/assessments/:jobId`, async ({ params, request }) => {
    try {
      await simulateNetwork();
      const assessment = await request.json();

      const existing = await db.assessments.where('jobId').equals(params.jobId).first();
      if (existing) {
        await db.assessments.update(existing.id, assessment);
      } else {
        await db.assessments.add(assessment);
      }

      return HttpResponse.json(assessment);
    } catch (error) {
      return HttpResponse.json({ error: 'Failed to save assessment' }, { status: 500 });
    }
  }),

  http.post(`${BASE_URL}/assessments/:jobId/submit`, async ({ request }) => {
    try {
      await simulateNetwork();
      const response = await request.json();
      await db.assessmentResponses.add(response);
      return HttpResponse.json({ success: true }, { status: 201 });
    } catch (error) {
      return HttpResponse.json({ error: 'Failed to submit assessment' }, { status: 500 });
    }
  }),
];

export const worker = setupWorker(...handlers);


