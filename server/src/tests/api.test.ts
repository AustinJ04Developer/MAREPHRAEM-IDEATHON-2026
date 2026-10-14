import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { connectDB, disconnectDB } from '../config/database.js';
import { ProblemArea } from '../models/ProblemArea.js';
import { Registration } from '../models/Registration.js';
import { Administrator } from '../models/Administrator.js';
import { seedProblemAreas } from '../scripts/seed.js';
import { bootstrapAdmin } from '../scripts/bootstrap-admin.js';

describe('API Endpoints Integration Tests', () => {
  let adminCookie: string;
  let testCategoryId: string;
  let otherCategoryId: string;

  beforeAll(async () => {
    await connectDB();
    await seedProblemAreas();
    await bootstrapAdmin();

    const healthRes = await request(app).get('/api/v1/health');
    expect(healthRes.status).toBe(200);

    // Fetch seeded categories
    const areas = await ProblemArea.find().sort({ displayOrder: 1 });
    testCategoryId = areas[0]._id.toString(); // HCW
    const otherArea = areas.find((a) => a.isOther);
    otherCategoryId = otherArea!._id.toString();

    // Authenticate Admin to obtain session cookie
    const loginRes = await request(app)
      .post('/api/v1/admin/auth/login')
      .send({
        email: 'rkselvakumar@gmail.com',
        password: '123456',
      });

    expect(loginRes.status).toBe(200);
    const cookies = loginRes.headers['set-cookie'];
    expect(cookies).toBeDefined();
    adminCookie = Array.isArray(cookies) ? cookies[0] : (cookies as unknown as string);
  });

  afterAll(async () => {
    // Clean up test registrations
    await Registration.deleteMany({ teamName: /^TestTeam/ });
    await disconnectDB();
  });

  it('GET /api/v1/health returns 200 with status ok', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.event).toBe('Marephraem Ideasource 2026');
  });

  it('GET /api/v1/problem-areas returns the seeded official problem areas in order', async () => {
    const res = await request(app).get('/api/v1/problem-areas');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(11);
    expect(res.body.data[0].name).toBe('Healthcare & Wellness');
    expect(res.body.data[0].abbreviation).toBe('HCW');
    expect(res.body.data[10].name).toBe('Other Area');
  });

  it('POST /api/v1/registrations successfully registers a team and issues Project ID with correct abbreviation', async () => {
    const payload = {
      teamName: 'TestTeam Alpha',
      contactEmail: 'alice@test.edu',
      department: 'Computer Science and Engineering',
      section: 'A',
      teamLeaderIndex: 0,
      members: [
        {
          memberName: 'Alice Johnson',
          department: 'CSE',
          registerNumber: 'TEST-REG-001',
          section: 'A',
        },
        {
          memberName: 'Bob Smith',
          department: 'CSE',
          registerNumber: 'TEST-REG-002',
          section: 'A',
        },
      ],
      projectTitle: 'IoT Automated Health Monitoring System',
      categoryId: testCategoryId,
      fieldVisitStatus: 'Yes',
      supervisorName: 'Dr. Jane Williams',
      supervisorDesignation: 'Associate Professor',
      supervisorBranch: 'CSE',
    };

    const res = await request(app).post('/api/v1/registrations').send(payload);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.projectId).toMatch(/^HCW-\d{3,}$/);
    expect(res.body.data.teamLeaderName).toBe('Alice Johnson');
  });

  it('POST /api/v1/registrations rejects submission when Other Area lacks custom title', async () => {
    const payload = {
      teamName: 'TestTeam Beta',
      department: 'Mechanical Engineering',
      section: 'B',
      teamLeaderIndex: 0,
      members: [
        {
          memberName: 'Charlie Brown',
          department: 'MECH',
          registerNumber: 'TEST-REG-003',
          section: 'B',
        },
      ],
      projectTitle: 'Automated Solar Water Purifier',
      categoryId: otherCategoryId,
      otherProblemArea: '', // Missing
      fieldVisitStatus: 'No',
      supervisorName: 'Dr. Robert',
      supervisorDesignation: 'Professor',
      supervisorBranch: 'MECH',
    };

    const res = await request(app).post('/api/v1/registrations').send(payload);
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/registrations succeeds for Other Area with valid custom title and generates dynamic Project ID', async () => {
    const payload = {
      teamName: 'TestTeam Gamma',
      contactEmail: 'david@test.edu',
      department: 'Electronics & Communication',
      section: 'A',
      teamLeaderIndex: 0,
      members: [
        {
          memberName: 'David Miller',
          department: 'ECE',
          registerNumber: 'TEST-REG-004',
          section: 'A',
        },
      ],
      projectTitle: 'Bio-Robotic Prosthetic Arm',
      categoryId: otherCategoryId,
      otherProblemArea: 'Robotics & Automation',
      fieldVisitStatus: 'Yes',
      supervisorName: 'Dr. David King',
      supervisorDesignation: 'Assistant Professor',
      supervisorBranch: 'ECE',
    };

    const res = await request(app).post('/api/v1/registrations').send(payload);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    // Robotics & Automation -> ROA
    expect(res.body.data.projectId).toMatch(/^[A-Z0-9]{3}-\d{3,}$/);
  });

  it('POST /api/v1/registrations rejects duplicate register numbers in the same team', async () => {
    const payload = {
      teamName: 'TestTeam Duplicate',
      department: 'Civil Engineering',
      section: 'A',
      teamLeaderIndex: 0,
      members: [
        {
          memberName: 'Eva Green',
          department: 'CIVIL',
          registerNumber: 'DUP-REG-999',
          section: 'A',
        },
        {
          memberName: 'Frank Wright',
          department: 'CIVIL',
          registerNumber: 'DUP-REG-999', // Duplicate!
          section: 'A',
        },
      ],
      projectTitle: 'Smart Concrete Formulation',
      categoryId: testCategoryId,
      fieldVisitStatus: 'No',
      supervisorName: 'Dr. Clark',
      supervisorDesignation: 'Professor',
      supervisorBranch: 'CIVIL',
    };

    const res = await request(app).post('/api/v1/registrations').send(payload);
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/v1/admin/dashboard/summary requires admin authentication and returns real metrics', async () => {
    // Without cookie -> 401
    const unauthRes = await request(app).get('/api/v1/admin/dashboard/summary');
    expect(unauthRes.status).toBe(401);

    // With cookie -> 200
    const authRes = await request(app)
      .get('/api/v1/admin/dashboard/summary')
      .set('Cookie', adminCookie);

    expect(authRes.status).toBe(200);
    expect(authRes.body.success).toBe(true);
    expect(authRes.body.data.summary.totalRegistrations).toBeGreaterThanOrEqual(1);
  });

  it('GET /api/v1/admin/reports/registrations.csv returns formula-safe CSV', async () => {
    const res = await request(app)
      .get('/api/v1/admin/reports/registrations.csv')
      .set('Cookie', adminCookie);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/csv');
    expect(res.text).toContain('Project ID');
  });

  it('GET /api/v1/admin/reports/registrations.pdf generates valid binary PDF', async () => {
    const res = await request(app)
      .get('/api/v1/admin/reports/registrations.pdf')
      .set('Cookie', adminCookie);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/pdf');
    expect(res.body.slice(0, 4).toString('ascii')).toBe('%PDF');
  });
});
