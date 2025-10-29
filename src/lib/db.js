import Dexie from 'dexie';

class TalentFlowDB extends Dexie {
  constructor() {
    super('TalentFlowDB');
    this.version(1).stores({
      jobs: 'id, title, status, order',
      candidates: 'id, name, email, stage, jobId',
      candidateTimeline: 'id, candidateId, timestamp',
      candidateNotes: 'id, candidateId, createdAt',
      assessments: 'id, jobId',
      assessmentResponses: 'id, assessmentId, candidateId',
    });
  }
}

export const db = new TalentFlowDB();


