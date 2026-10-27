/**
 * Additional Knowledge Base Generator:
 * Generates Cross-Family Skills Taxonomy and Evaluation Test Cases.
 */

const fs = require('fs');
const path = require('path');

// 1. Cross-Family Skills Taxonomy
const skillsTaxonomy = {
  version: '1.0.0',
  updatedAt: new Date().toISOString(),
  categories: [
    {
      category: 'Software Engineering & Web',
      skills: [
        { canonical: 'JavaScript', synonyms: ['JS', 'ECMAScript', 'ES6', 'ES2022'], category: 'Languages' },
        { canonical: 'TypeScript', synonyms: ['TS'], category: 'Languages' },
        { canonical: 'Python', synonyms: ['Python3', 'Py3'], category: 'Languages' },
        { canonical: 'React', synonyms: ['React.js', 'ReactJS', 'React 18'], category: 'Frameworks' },
        { canonical: 'Next.js', synonyms: ['NextJS', 'Next 14', 'App Router'], category: 'Frameworks' },
        { canonical: 'Node.js', synonyms: ['NodeJS', 'Node runtime', 'Express.js'], category: 'Backend' },
        { canonical: 'RESTful APIs', synonyms: ['REST API', 'RESTful Web Services', 'HTTP APIs'], category: 'Architecture' },
        { canonical: 'GraphQL', synonyms: ['GQL', 'Apollo Client', 'Apollo Server'], category: 'Architecture' },
        { canonical: 'SQL', synonyms: ['Structured Query Language', 'PostgreSQL', 'MySQL', 'MSSQL'], category: 'Databases' },
        { canonical: 'MongoDB', synonyms: ['Mongo', 'NoSQL', 'DocumentDB'], category: 'Databases' }
      ]
    },
    {
      category: 'Cloud, DevOps & Infrastructure',
      skills: [
        { canonical: 'Amazon Web Services', synonyms: ['AWS', 'Amazon Cloud', 'EC2', 'S3', 'Lambda'], category: 'Cloud' },
        { canonical: 'Microsoft Azure', synonyms: ['Azure', 'Azure Cloud', 'Azure DevOps'], category: 'Cloud' },
        { canonical: 'Docker', synonyms: ['Docker Engine', 'Docker Compose', 'Containerization'], category: 'Containers' },
        { canonical: 'Kubernetes', synonyms: ['K8s', 'EKS', 'AKS', 'GKE', 'Container Orchestration'], category: 'Containers' },
        { canonical: 'Terraform', synonyms: ['IaC', 'Infrastructure as Code', 'HashiCorp Terraform'], category: 'IaC' },
        { canonical: 'CI/CD', synonyms: ['Continuous Integration', 'Continuous Deployment', 'GitHub Actions', 'GitLab CI', 'Jenkins'], category: 'DevOps' }
      ]
    },
    {
      category: 'AI, Data & Analytics',
      skills: [
        { canonical: 'Machine Learning', synonyms: ['ML', 'Supervised Learning', 'Scikit-Learn', 'Statistical Learning'], category: 'AI' },
        { canonical: 'Deep Learning', synonyms: ['DL', 'PyTorch', 'TensorFlow', 'Neural Networks'], category: 'AI' },
        { canonical: 'Large Language Models', synonyms: ['LLM', 'Generative AI', 'GenAI', 'Transformers', 'Prompt Engineering', 'RAG'], category: 'AI' },
        { canonical: 'Apache Spark', synonyms: ['Spark', 'PySpark', 'Databricks'], category: 'Big Data' },
        { canonical: 'Snowflake', synonyms: ['Snowflake Data Cloud', 'Snowflake DW'], category: 'Data Warehousing' },
        { canonical: 'Power BI', synonyms: ['PowerBI', 'Microsoft Power BI', 'DAX'], category: 'BI' },
        { canonical: 'Tableau', synonyms: ['Tableau Desktop', 'Tableau Server'], category: 'BI' }
      ]
    },
    {
      category: 'Project Management & Leadership',
      skills: [
        { canonical: 'Agile Methodology', synonyms: ['Agile', 'Scrum', 'Kanban', 'Sprint Planning'], category: 'Methodology' },
        { canonical: 'Jira', synonyms: ['Atlassian Jira', 'Jira Software'], category: 'Tools' },
        { canonical: 'PMP', synonyms: ['Project Management Professional', 'PMI PMP'], category: 'Certifications' },
        { canonical: 'Risk Management', synonyms: ['RAID Logs', 'Risk Mitigation', 'Contingency Planning'], category: 'Governance' }
      ]
    }
  ]
};

// 2. Curated Evaluation Test Cases
const evaluationCases = [
  {
    id: 'case-01-fullstack-perfect-match',
    description: 'Senior Full Stack developer with matching skills against a Senior Web Engineer JD',
    jobFamily: 'software-development',
    candidate: {
      fullName: 'Alex Vance',
      headline: 'Senior Full Stack Engineer (TypeScript, React, Node.js)',
      skills: ['TypeScript', 'JavaScript', 'React', 'Next.js', 'Node.js', 'PostgreSQL', 'Docker', 'AWS', 'RESTful APIs', 'Jest'],
      yearsExperience: 6,
      experienceCount: 3,
      hasDegree: true
    },
    jobDescription: {
      title: 'Senior Full Stack Software Engineer',
      requiredSkills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'RESTful APIs'],
      preferredSkills: ['Docker', 'AWS', 'Next.js'],
      requiredExperienceYears: 5
    },
    expectedEvaluation: {
      requiredCoverageMin: 1.0,
      matchCategory: 'Strong Match',
      isAtsApproved: true
    }
  },
  {
    id: 'case-02-career-change-transferable',
    description: 'Data Analyst transitioning into Machine Learning Engineer role',
    jobFamily: 'ai-data',
    candidate: {
      fullName: 'Sarah Chen',
      headline: 'Data Analyst transitioning to Machine Learning Engineer',
      skills: ['Python', 'SQL', 'Pandas', 'Tableau', 'Statistics', 'Git', 'Scikit-Learn'],
      yearsExperience: 3,
      experienceCount: 2,
      hasDegree: true
    },
    jobDescription: {
      title: 'Junior Machine Learning Engineer',
      requiredSkills: ['Python', 'SQL', 'Scikit-Learn', 'PyTorch'],
      preferredSkills: ['Docker', 'MLOps', 'FastAPI'],
      requiredExperienceYears: 2
    },
    expectedEvaluation: {
      requiredCoverageMin: 0.75,
      missingSkills: ['PyTorch'],
      matchCategory: 'Moderate Match - Gap Detected',
      isAtsApproved: true
    }
  },
  {
    id: 'case-03-severe-qualification-gap',
    description: 'Frontend developer applying for a Licensed Professional Civil Engineer role',
    jobFamily: 'construction-infrastructure',
    candidate: {
      fullName: 'Jordan Miller',
      headline: 'Junior Web Developer',
      skills: ['HTML', 'CSS', 'JavaScript', 'React'],
      yearsExperience: 1,
      experienceCount: 1,
      hasDegree: false
    },
    jobDescription: {
      title: 'Senior Civil Structural Engineer (PE Licensed)',
      requiredSkills: ['AutoCAD', 'Civil Engineering', 'Structural Analysis', 'PE License', 'Building Codes'],
      preferredSkills: ['Revit', 'Bluebeam'],
      requiredExperienceYears: 6
    },
    expectedEvaluation: {
      requiredCoverageMax: 0.1,
      matchCategory: 'Unqualified / High Gap',
      isAtsApproved: false
    }
  }
];

// Write skills taxonomy
const skillsPath = path.join(__dirname, '..', 'knowledge', 'skills', 'taxonomy.json');
fs.writeFileSync(skillsPath, JSON.stringify(skillsTaxonomy, null, 2), 'utf8');
console.log(`Generated: knowledge/skills/taxonomy.json (${skillsTaxonomy.categories.length} categories)`);

// Write evaluation cases
const casesPath = path.join(__dirname, '..', 'knowledge', 'evaluation-cases', 'cases.json');
fs.writeFileSync(casesPath, JSON.stringify({
  version: '1.0.0',
  totalCases: evaluationCases.length,
  cases: evaluationCases
}, null, 2), 'utf8');
console.log(`Generated: knowledge/evaluation-cases/cases.json (${evaluationCases.length} evaluation cases)`);
