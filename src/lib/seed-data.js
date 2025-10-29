import { db } from './db';

const jobTitles = [
  'Senior Frontend Developer',
  'Backend Engineer',
  'Full Stack Developer',
  'DevOps Engineer',
  'Product Manager',
  'UI/UX Designer',
  'Data Scientist',
  'Mobile Developer',
  'QA Engineer',
  'Technical Lead',
  'Software Architect',
  'Security Engineer',
  'Machine Learning Engineer',
  'Cloud Solutions Architect',
  'Site Reliability Engineer',
];

const techTags = ['React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'Docker', 'Kubernetes', 'GraphQL', 'PostgreSQL', 'MongoDB', 'Go', 'Rust', 'Java', 'C++'];

const firstNames = ['Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason', 'Isabella', 'William', 'Mia', 'James', 'Charlotte', 'Benjamin', 'Amelia', 'Lucas', 'Harper', 'Henry', 'Evelyn', 'Alexander'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];

const stages = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'];

function generateSlug(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomItems(array, count) {
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export async function seedDatabase() {
  const jobCount = await db.jobs.count();
  if (jobCount > 0) {
    console.log('Database already seeded');
    return;
  }

  console.log('Seeding database...');

  const jobs = [];
  for (let i = 0; i < 25; i++) {
    const title = i < jobTitles.length ? jobTitles[i] : `${randomItem(jobTitles)} ${i}`;
    const job = {
      id: `job-${i + 1}`,
      title,
      slug: generateSlug(title),
      status: Math.random() > 0.3 ? 'active' : 'archived',
      tags: randomItems(techTags, Math.floor(Math.random() * 4) + 1),
      order: i,
      description: `We're looking for an experienced ${title.toLowerCase()} to join our team.`,
      createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
    };
    jobs.push(job);
  }
  await db.jobs.bulkAdd(jobs);

  const candidates = [];
  for (let i = 0; i < 1000; i++) {
    const candidate = {
      id: `candidate-${i + 1}`,
      name: `${randomItem(firstNames)} ${randomItem(lastNames)}`,
      email: `candidate${i + 1}@example.com`,
      stage: randomItem(stages),
      jobId: randomItem(jobs).id,
      appliedAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
      phone: `+1 ${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
    };
    candidates.push(candidate);
  }
  await db.candidates.bulkAdd(candidates);

  const assessments = [];
  const activeJobs = jobs.filter((job) => job.status === 'active');

  for (let i = 0; i < activeJobs.length; i++) {
    const job = activeJobs[i];
    const jobTags = job.tags;

    const questions = [];

    if (jobTags.length > 0) {
      questions.push({
        id: `q-${i}-1`,
        type: 'multi-choice',
        text: `Which of these technologies are you proficient in for the ${job.title} role?`,
        required: true,
        options: jobTags.slice(0, 6),
      });
    }

    questions.push({
      id: `q-${i}-2`,
      type: 'single-choice',
      text: `How many years of experience do you have in ${job.title.toLowerCase()}?`,
      required: true,
      options: ['0-1 years', '2-3 years', '4-5 years', '6-10 years', '10+ years'],
    });

    if (i % 2 === 0) {
      questions.push({
        id: `q-${i}-3`,
        type: 'long-text',
        text: `Describe a challenging project you worked on related to ${job.title.toLowerCase()}. What was your role and the outcome?`,
        required: true,
        maxLength: 500,
      });
    } else {
      questions.push({
        id: `q-${i}-3`,
        type: 'long-text',
        text: `Why are you interested in this ${job.title} position? What motivates you about this role?`,
        required: true,
        maxLength: 400,
      });
    }

    const sections = [
      {
        id: `section-${i}-1`,
        title: `${job.title} Assessment`,
        questions: questions,
      },
    ];

    const assessment = {
      id: `assessment-${i + 1}`,
      jobId: job.id,
      sections,
      createdAt: new Date().toISOString(),
    };
    assessments.push(assessment);
  }
  await db.assessments.bulkAdd(assessments);

  console.log('Database seeded successfully');
}


