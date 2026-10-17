const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Job = require('../models/Job');

const sampleJobs = [
  {
    title: 'Full Stack Developer',
    location: 'Remote',
    minimumExperience: 2,
    requiredSkills: ['MongoDB', 'Express.js', 'React', 'Node.js', 'JavaScript', 'REST API'],
    preferredSkills: ['TypeScript', 'Git', 'Docker', 'AWS'],
    education: ['B.E.', 'B.Tech', 'MCA'],
    status: 'open',
    description: 'We are looking for an experienced Full Stack Developer to build scalable web applications using modern JavaScript/TypeScript stacks.'
  },
  {
    title: 'Frontend Developer',
    location: 'Noida',
    minimumExperience: 1,
    requiredSkills: ['React', 'JavaScript', 'HTML', 'CSS', 'Tailwind CSS'],
    preferredSkills: ['TypeScript', 'Git', 'REST API'],
    education: ['B.E.', 'B.Tech', 'B.Sc'],
    status: 'open',
    description: 'Seeking a creative Frontend Developer proficient in React.js, modern CSS frameworks, and responsive user interface engineering.'
  },
  {
    title: 'Backend Developer',
    location: 'Gurugram',
    minimumExperience: 2,
    requiredSkills: ['Node.js', 'Express.js', 'MongoDB', 'REST API', 'JavaScript'],
    preferredSkills: ['Redis', 'Docker', 'AWS'],
    education: ['B.E.', 'B.Tech', 'MCA'],
    status: 'open',
    description: 'Join our engineering team as a Backend Developer responsible for constructing robust RESTful microservices and database layer integrations.'
  },
  {
    title: 'MERN Stack Developer',
    location: 'Remote',
    minimumExperience: 1,
    requiredSkills: ['MongoDB', 'Express.js', 'React', 'Node.js', 'JavaScript'],
    preferredSkills: ['Git', 'REST API', 'AWS'],
    education: ['B.E.', 'B.Tech', 'MCA'],
    status: 'open',
    description: 'Looking for a versatile MERN Stack Developer to design, build, and deploy high-performance web applications.'
  },
  {
    title: 'Python Developer',
    location: 'Bengaluru',
    minimumExperience: 1,
    requiredSkills: ['Python', 'FastAPI', 'Flask', 'SQL', 'REST API'],
    preferredSkills: ['Docker', 'AWS', 'PostgreSQL'],
    education: ['B.E.', 'B.Tech', 'M.Sc'],
    status: 'open',
    description: 'Hiring a Python Developer with expertise in FastAPI/Flask backend frameworks and clean data processing pipelines.'
  },
  {
    title: 'Java Developer',
    location: 'Hyderabad',
    minimumExperience: 2,
    requiredSkills: ['Java', 'Spring Boot', 'SQL', 'REST API', 'Git'],
    preferredSkills: ['Docker', 'Microservices', 'AWS'],
    education: ['B.E.', 'B.Tech', 'MCA'],
    status: 'open',
    description: 'Enterprise software team seeking a Java Developer with strong Spring Boot and relational database design experience.'
  },
  {
    title: 'Machine Learning Engineer',
    location: 'Bengaluru',
    minimumExperience: 2,
    requiredSkills: ['Python', 'Machine Learning', 'Scikit-learn', 'Pandas', 'NumPy'],
    preferredSkills: ['TensorFlow', 'PyTorch', 'NLP', 'AWS'],
    education: ['B.Tech', 'M.Tech', 'Ph.D.'],
    status: 'open',
    description: 'Seeking a Machine Learning Engineer to develop, evaluate, and deploy predictive ML models and NLP algorithms into production.'
  },
  {
    title: 'Data Analyst',
    location: 'Pune',
    minimumExperience: 1,
    requiredSkills: ['Python', 'SQL', 'Pandas', 'NumPy', 'Excel'],
    preferredSkills: ['Power BI', 'Tableau', 'Machine Learning'],
    education: ['B.Sc', 'B.Tech', 'M.Sc'],
    status: 'open',
    description: 'Looking for a Data Analyst to transform complex datasets into actionable business intelligence dashboards and statistical insights.'
  },
  {
    title: 'DevOps Engineer',
    location: 'Remote',
    minimumExperience: 2,
    requiredSkills: ['Linux', 'Docker', 'Git', 'AWS', 'CI/CD'],
    preferredSkills: ['Kubernetes', 'Jenkins', 'Terraform'],
    education: ['B.E.', 'B.Tech'],
    status: 'open',
    description: 'Seeking a DevOps Engineer to automate deployment pipelines, maintain infrastructure-as-code, and manage cloud monitoring.'
  },
  {
    title: 'Cloud Engineer',
    location: 'Noida',
    minimumExperience: 2,
    requiredSkills: ['AWS', 'Linux', 'Docker', 'Networking', 'Git'],
    preferredSkills: ['Kubernetes', 'Azure', 'Terraform'],
    education: ['B.E.', 'B.Tech', 'MCA'],
    status: 'open',
    description: 'Join as a Cloud Engineer overseeing cloud infrastructure provisioning, security configurations, and high availability systems.'
  }
];

const seedJobs = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai_resume_screening';
    console.log('Connecting to MongoDB:', mongoUri);
    await mongoose.connect(mongoUri);

    // Get all recruiters or create a default demo recruiter
    let recruiters = await User.find({ role: 'recruiter' });

    const defaultEmail = 'recruiter@example.com';
    const defaultPassword = 'password123';

    let defaultRecruiter = await User.findOne({ email: defaultEmail });
    if (!defaultRecruiter) {
      defaultRecruiter = await User.create({
        name: 'Demo Recruiter',
        email: defaultEmail,
        password: defaultPassword,
        role: 'recruiter'
      });
      console.log(`[SEED] Created default recruiter: ${defaultEmail}`);
    } else {
      defaultRecruiter.password = defaultPassword;
      await defaultRecruiter.save();
      console.log(`[SEED] Updated password for default recruiter: ${defaultEmail}`);
    }

    // Include defaultRecruiter in recruiters array if not already present
    if (!recruiters.some(r => r.email === defaultEmail)) {
      recruiters.push(defaultRecruiter);
    }

    console.log(`[SEED] Seeding demo jobs for ${recruiters.length} recruiter account(s)...`);

    let totalSeeded = 0;

    for (const recruiter of recruiters) {
      for (const jobData of sampleJobs) {
        const seededJob = await Job.findOneAndUpdate(
          { title: jobData.title, recruiterId: recruiter._id },
          {
            ...jobData,
            recruiterId: recruiter._id
          },
          { upsert: true, new: true }
        );
        totalSeeded++;
      }
      console.log(`[SEED] Seeded ${sampleJobs.length} jobs for recruiter: ${recruiter.email} (${recruiter._id})`);
    }

    console.log(`============================================================`);
    console.log(`SUCCESS: Seeding complete! ${totalSeeded} job entries upserted across ${recruiters.length} recruiter(s).`);
    console.log(`============================================================`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding demo jobs:', error.message);
    process.exit(1);
  }
};

seedJobs();
