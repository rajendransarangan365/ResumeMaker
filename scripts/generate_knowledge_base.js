/**
 * Comprehensive Job Family Knowledge Base Generator
 * Generates all 20 standardized, in-depth Job Family taxonomies for ATS Resume Intelligence Studio.
 */

const fs = require('fs');
const path = require('path');

const jobFamilies = [
  {
    id: 'software-development',
    displayName: 'Software Development',
    description: 'Design, development, testing, and deployment of software applications, web systems, microservices, and mobile apps.',
    category: 'Technology',
    seniorityLevels: ['Entry / Junior', 'Mid-Level', 'Senior', 'Lead / Staff', 'Principal / Architect', 'Engineering Manager'],
    jobTitles: [
      { title: 'Full Stack Developer', level: 'Mid-Level', alternativeTitles: ['Full Stack Software Engineer', 'Web Applications Engineer', 'Software Developer'] },
      { title: 'Frontend Developer', level: 'Mid-Level', alternativeTitles: ['Frontend Engineer', 'UI/UX Developer', 'React/Vue Developer'] },
      { title: 'Backend Developer', level: 'Mid-Level', alternativeTitles: ['Backend Software Engineer', 'API Engineer', 'Server-Side Developer'] },
      { title: 'Senior Software Engineer', level: 'Senior', alternativeTitles: ['Senior Full Stack Engineer', 'Senior Backend Engineer', 'Senior Developer'] },
      { title: 'Lead Software Engineer', level: 'Lead / Staff', alternativeTitles: ['Tech Lead', 'Staff Engineer', 'Engineering Lead'] },
      { title: 'Mobile Developer', level: 'Mid-Level', alternativeTitles: ['iOS Developer', 'Android Developer', 'React Native Developer', 'Flutter Developer'] },
      { title: 'Junior Software Engineer', level: 'Entry / Junior', alternativeTitles: ['Associate Software Engineer', 'Graduate Developer', 'Junior Programmer'] },
      { title: 'Software Architect', level: 'Principal / Architect', alternativeTitles: ['Solutions Architect', 'Enterprise Software Architect', 'Systems Architect'] }
    ],
    skills: {
      technicalSkills: [
        { name: 'JavaScript', category: 'Programming Languages', synonyms: ['JS', 'ECMAScript', 'ES6+'], importance: 'High' },
        { name: 'TypeScript', category: 'Programming Languages', synonyms: ['TS'], importance: 'High' },
        { name: 'Python', category: 'Programming Languages', synonyms: ['Py3', 'Python3'], importance: 'High' },
        { name: 'Java', category: 'Programming Languages', synonyms: ['Java 17', 'Core Java', 'J2EE'], importance: 'High' },
        { name: 'C#', category: 'Programming Languages', synonyms: ['C-Sharp', '.NET', 'CSharp'], importance: 'Medium' },
        { name: 'Go', category: 'Programming Languages', synonyms: ['Golang'], importance: 'Medium' },
        { name: 'React', category: 'Frontend Frameworks', synonyms: ['React.js', 'ReactJS', 'React 18'], importance: 'High' },
        { name: 'Next.js', category: 'Frontend Frameworks', synonyms: ['NextJS', 'Next 14'], importance: 'High' },
        { name: 'Node.js', category: 'Backend Runtimes', synonyms: ['NodeJS', 'Node', 'Express.js'], importance: 'High' },
        { name: 'RESTful APIs', category: 'API Architecture', synonyms: ['REST APIs', 'REST Web Services', 'HTTP APIs'], importance: 'High' },
        { name: 'GraphQL', category: 'API Architecture', synonyms: ['GQL', 'Apollo GraphQL'], importance: 'Medium' },
        { name: 'Microservices', category: 'Architecture', synonyms: ['Microservice Architecture', 'Distributed Systems'], importance: 'High' },
        { name: 'SQL & Relational DBs', category: 'Databases', synonyms: ['PostgreSQL', 'MySQL', 'Relational Databases'], importance: 'High' },
        { name: 'NoSQL DBs', category: 'Databases', synonyms: ['MongoDB', 'DynamoDB', 'Redis', 'Document DB'], importance: 'High' },
        { name: 'CI/CD Pipelines', category: 'DevOps & Tooling', synonyms: ['Continuous Integration', 'GitHub Actions', 'GitLab CI', 'Jenkins'], importance: 'High' },
        { name: 'Docker & Containerization', category: 'DevOps & Tooling', synonyms: ['Docker', 'Containers', 'Kubernetes', 'K8s'], importance: 'High' },
        { name: 'Automated Testing', category: 'Quality & Testing', synonyms: ['Unit Testing', 'Jest', 'Vitest', 'Cypress', 'Playwright', 'TDD'], importance: 'High' },
        { name: 'Git & Version Control', category: 'Collaboration', synonyms: ['Git', 'GitHub', 'GitLab', 'Branching Strategies'], importance: 'High' }
      ],
      toolsAndPlatforms: [
        { name: 'Docker', synonyms: ['Docker Desktop', 'Docker Engine'] },
        { name: 'Kubernetes', synonyms: ['K8s', 'EKS', 'GKE'] },
        { name: 'AWS', synonyms: ['Amazon Web Services', 'EC2', 'S3', 'Lambda'] },
        { name: 'Git & GitHub', synonyms: ['GitHub Enterprise', 'GitLab', 'Bitbucket'] },
        { name: 'Postman', synonyms: ['API Testing', 'Swagger', 'OpenAPI'] }
      ],
      domainTerminology: [
        'High-throughput microservices', 'Idempotent endpoints', 'Event-driven architecture',
        'Database indexing & query optimization', 'Zero-downtime deployment', 'State management',
        'Asynchronous processing', 'Concurrency & race conditions', 'OAuth2 / JWT authentication'
      ],
      softSkills: ['Analytical Problem Solving', 'Cross-functional Collaboration', 'Code Review & Mentorship', 'Agile/Scrum Delivery', 'Technical Communication']
    },
    commonCertifications: ['AWS Certified Developer - Associate', 'AWS Certified Solutions Architect', 'Meta Certified Frontend Developer', 'Oracle Certified Professional: Java SE', 'Certified Kubernetes Application Developer (CKAD)'],
    commonQualifications: ["Bachelor's or Master's in Computer Science, Software Engineering, or equivalent practical industry experience"],
    achievementPatterns: {
      actionVerbs: ['Architected', 'Engineered', 'Optimized', 'Refactored', 'Spearheaded', 'Automated', 'Streamlined', 'Decommissioned'],
      metricTemplates: [
        'Reduced API response latency by [X]% across [Y] endpoints by implementing Redis caching and indexing query paths.',
        'Architected and delivered [X] microservices handling [Y] daily active requests with 99.99% uptime.',
        'Refactored legacy monolithic codebase into TypeScript, reducing production bug regressions by [X]%.',
        'Automated CI/CD build and testing pipeline, cutting release deployment cycle time from [X] hours to [Y] minutes.'
      ]
    },
    resumeWritingGuidance: {
      summaryStrategy: 'Lead with stack specialization (e.g., Full Stack / Backend), years of experience, scale of systems built, and core performance wins.',
      keySectionsRecommended: ['Professional Summary', 'Technical Skills (Languages, Frameworks, Cloud/DevOps, Databases)', 'Professional Experience', 'Key Projects / Open Source', 'Education & Certifications'],
      commonPitfalls: ['Listing tools without specifying context in experience bullets', 'Missing performance metrics or scale indicators', 'Using outdated terminology without specifying modern versions']
    },
    exampleJobDescriptions: [
      {
        title: 'Senior Full Stack Engineer',
        company: 'CloudScale Technologies',
        requiredExperienceYears: 5,
        requiredQualifications: ["Bachelor's in Computer Science or related degree", '5+ years building scalable web services with Node.js and TypeScript', 'Demonstrated mastery of React/Next.js and state architecture', 'Hands-on production experience with PostgreSQL and Docker'],
        preferredQualifications: ['AWS cloud deployment experience', 'GraphQL and Kafka event streams experience', 'Experience mentoring junior/mid developers']
      }
    ]
  },
  {
    id: 'it-infrastructure-cloud',
    displayName: 'IT Infrastructure and Cloud',
    description: 'System administration, cloud engineering, network architecture, virtualization, site reliability, and enterprise IT support.',
    category: 'Technology',
    seniorityLevels: ['Junior IT Specialist', 'Systems Administrator', 'Cloud Engineer', 'Senior DevOps Engineer', 'Site Reliability Engineer (SRE)', 'Infrastructure Architect'],
    jobTitles: [
      { title: 'Cloud Engineer', level: 'Mid-Level', alternativeTitles: ['AWS Cloud Engineer', 'Azure Cloud Engineer', 'Cloud Systems Engineer'] },
      { title: 'DevOps Engineer', level: 'Mid-Level', alternativeTitles: ['Build and Release Engineer', 'DevSecOps Engineer', 'Platform Engineer'] },
      { title: 'Site Reliability Engineer (SRE)', level: 'Senior', alternativeTitles: ['SRE', 'Reliability Engineer', 'Infrastructure Operations Engineer'] },
      { title: 'Systems Administrator', level: 'Mid-Level', alternativeTitles: ['SysAdmin', 'Linux Administrator', 'Windows Systems Administrator'] },
      { title: 'Network Engineer', level: 'Mid-Level', alternativeTitles: ['Network Specialist', 'Cisco Network Engineer', 'Infrastructure Network Architect'] },
      { title: 'Cloud Solutions Architect', level: 'Principal / Architect', alternativeTitles: ['Enterprise Cloud Architect', 'Infrastructure Architect'] }
    ],
    skills: {
      technicalSkills: [
        { name: 'Amazon Web Services (AWS)', category: 'Cloud Platforms', synonyms: ['AWS', 'EC2', 'S3', 'RDS', 'IAM', 'CloudFormation'], importance: 'High' },
        { name: 'Microsoft Azure', category: 'Cloud Platforms', synonyms: ['Azure', 'Azure AD', 'Azure VMs', 'ARM Templates'], importance: 'High' },
        { name: 'Google Cloud Platform (GCP)', category: 'Cloud Platforms', synonyms: ['GCP', 'GCE', 'GCS', 'BigQuery'], importance: 'Medium' },
        { name: 'Terraform & IaC', category: 'Infrastructure as Code', synonyms: ['Terraform', 'Infrastructure as Code', 'IaC', 'Terragrunt'], importance: 'High' },
        { name: 'Kubernetes & Helm', category: 'Orchestration', synonyms: ['K8s', 'Helm', 'EKS', 'AKS'], importance: 'High' },
        { name: 'Linux Systems Administration', category: 'Operating Systems', synonyms: ['RHEL', 'Ubuntu Server', 'Debian', 'Bash Scripting', 'Shell'], importance: 'High' },
        { name: 'Monitoring & Observability', category: 'Observability', synonyms: ['Prometheus', 'Grafana', 'Datadog', 'ELK Stack', 'CloudWatch'], importance: 'High' },
        { name: 'Network Protocols & Routing', category: 'Networking', synonyms: ['TCP/IP', 'BGP', 'DNS', 'DHCP', 'VPC', 'VPN', 'Firewalls'], importance: 'High' },
        { name: 'CI/CD Automation', category: 'Automation', synonyms: ['Ansible', 'Puppet', 'GitHub Actions', 'Jenkins'], importance: 'High' }
      ],
      toolsAndPlatforms: [
        { name: 'Terraform', synonyms: ['HashiCorp Terraform'] },
        { name: 'Datadog', synonyms: ['Datadog APM', 'Datadog Logs'] },
        { name: 'Ansible', synonyms: ['Ansible Playbooks', 'Ansible Tower'] },
        { name: 'Docker / Podman', synonyms: ['Container Runtimes'] }
      ],
      domainTerminology: [
        'Zero-trust network architecture', 'Mean Time to Resolution (MTTR)', 'High Availability (HA)',
        'Disaster Recovery (DR)', 'SLA / SLO / SLI adherence', 'Auto-scaling policies', 'Cost optimization (FinOps)'
      ],
      softSkills: ['Incident Response Under Pressure', 'Root Cause Analysis (RCA)', 'Capacity Planning', 'Technical Documentation', 'Cross-Team Incident Coordination']
    },
    commonCertifications: ['AWS Certified Solutions Architect', 'AWS Certified DevOps Engineer', 'Microsoft Certified: Azure Solutions Architect Expert', 'Certified Kubernetes Administrator (CKA)', 'Cisco Certified Network Associate (CCNA)'],
    commonQualifications: ["Bachelor's in Information Technology, Computer Science, or equivalent field experience with industry certifications"],
    achievementPatterns: {
      actionVerbs: ['Provisioned', 'Migrated', 'Architected', 'Automated', 'Configured', 'Hardened', 'Maintained', 'Remediated'],
      metricTemplates: [
        'Automated enterprise cloud provisioning using Terraform IaC, cutting infrastructure lead time from [X] days to [Y] minutes.',
        'Achieved [X]% infrastructure uptime SLA across [Y] production Kubernetes clusters serving [Z] end users.',
        'Designed multi-region disaster recovery strategy yielding an RPO of under [X] minutes and RTO of [Y] minutes.',
        'Reduced annual cloud expenditure by [X]% through automated resource scheduling and rightsizing EC2 instances.'
      ]
    },
    resumeWritingGuidance: {
      summaryStrategy: 'State platform certifications, total managed cloud/system scale, uptime statistics, and automation achievements.',
      keySectionsRecommended: ['Summary', 'Cloud & Infrastructure Certifications', 'Technical Expertise', 'Professional Experience', 'Education'],
      commonPitfalls: ['Failing to specify scale (number of servers, clusters, or user volume)', 'Omitting specific IaC or monitoring tooling']
    },
    exampleJobDescriptions: [
      {
        title: 'Senior DevOps / Cloud Engineer',
        company: 'Vanguard Platforms',
        requiredExperienceYears: 4,
        requiredQualifications: ['4+ years managing production infrastructure on AWS or Azure', 'Proficiency in Terraform, Docker, and Kubernetes', 'Experience establishing monitoring with Prometheus and Grafana'],
        preferredQualifications: ['CKA or AWS DevOps Engineer Professional certification', 'Python or Go scripting for infrastructure automation']
      }
    ]
  },
  {
    id: 'ai-data',
    displayName: 'Artificial Intelligence and Data',
    description: 'Data engineering, machine learning, data science, deep learning, business intelligence, generative AI, and statistical modeling.',
    category: 'Technology',
    seniorityLevels: ['Junior Data Analyst', 'Data Engineer', 'Machine Learning Engineer', 'Data Scientist', 'Senior AI Researcher', 'Head of Data'],
    jobTitles: [
      { title: 'Data Scientist', level: 'Mid-Level', alternativeTitles: ['Applied Scientist', 'Data Science Specialist', 'Quantitative Analyst'] },
      { title: 'Machine Learning Engineer', level: 'Mid-Level', alternativeTitles: ['ML Engineer', 'MLOps Engineer', 'AI Engineer'] },
      { title: 'Data Engineer', level: 'Mid-Level', alternativeTitles: ['Big Data Engineer', 'ETL Developer', 'Data Platform Engineer'] },
      { title: 'Senior AI Engineer', level: 'Senior', alternativeTitles: ['Senior ML Engineer', 'Lead Data Scientist', 'AI Solutions Architect'] },
      { title: 'Business Intelligence Analyst', level: 'Mid-Level', alternativeTitles: ['BI Developer', 'Analytics Specialist', 'Tableau/PowerBI Analyst'] },
      { title: 'Director of Data Science', level: 'Lead / Staff', alternativeTitles: ['Head of Analytics', 'VP of AI & Data', 'Chief Data Officer'] }
    ],
    skills: {
      technicalSkills: [
        { name: 'Python', category: 'Languages', synonyms: ['Python3', 'NumPy', 'Pandas', 'SciPy'], importance: 'High' },
        { name: 'SQL', category: 'Data Querying', synonyms: ['Advanced SQL', 'PostgreSQL', 'Snowflake SQL', 'BigQuery SQL'], importance: 'High' },
        { name: 'Machine Learning', category: 'ML & AI', synonyms: ['Scikit-Learn', 'Supervised Learning', 'Unsupervised Learning', 'XGBoost'], importance: 'High' },
        { name: 'Deep Learning', category: 'ML & AI', synonyms: ['PyTorch', 'TensorFlow', 'Keras', 'Neural Networks'], importance: 'High' },
        { name: 'Large Language Models (LLMs)', category: 'Generative AI', synonyms: ['Transformers', 'HuggingFace', 'LangChain', 'RAG', 'Prompt Engineering'], importance: 'High' },
        { name: 'Big Data Processing', category: 'Data Engineering', synonyms: ['Apache Spark', 'PySpark', 'Databricks', 'Kafka', 'Flink'], importance: 'High' },
        { name: 'Data Warehousing', category: 'Data Platforms', synonyms: ['Snowflake', 'Google BigQuery', 'Amazon Redshift', 'dbt'], importance: 'High' },
        { name: 'Data Visualization & BI', category: 'Analytics', synonyms: ['Power BI', 'Tableau', 'Looker', 'Matplotlib', 'Seaborn'], importance: 'High' },
        { name: 'MLOps & Model Deployment', category: 'MLOps', synonyms: ['MLflow', 'Kubeflow', 'Triton', 'Docker Model Serving'], importance: 'High' }
      ],
      toolsAndPlatforms: [
        { name: 'PyTorch', synonyms: ['Torch', 'TorchVision'] },
        { name: 'Snowflake', synonyms: ['Snowflake Data Cloud'] },
        { name: 'Apache Spark', synonyms: ['Spark', 'PySpark'] },
        { name: 'dbt', synonyms: ['data build tool'] }
      ],
      domainTerminology: [
        'Retrieval-Augmented Generation (RAG)', 'Feature engineering & selection', 'Vector embeddings & cosine similarity',
        'Model drift & latency optimization', 'ETL/ELT pipeline lineage', 'A/B hypothesis testing & statistical significance'
      ],
      softSkills: ['Translating Data into Business Strategy', 'Hypothesis-Driven Problem Solving', 'Stakeholder Data Storytelling', 'Experimental Rigor']
    },
    commonCertifications: ['AWS Certified Machine Learning - Specialty', 'Google Cloud Professional Data Engineer', 'Google Cloud Professional Machine Learning Engineer', 'Databricks Certified Data Engineer Associate', 'TensorFlow Developer Certificate'],
    commonQualifications: ["Bachelor's, Master's, or PhD in Computer Science, Data Science, Statistics, Mathematics, or Computational Engineering"],
    achievementPatterns: {
      actionVerbs: ['Engineered', 'Trained', 'Deployed', 'Modeled', 'Extracted', 'Synthesized', 'Fine-Tuned', 'Evaluated'],
      metricTemplates: [
        'Developed customer churn predictive model in PyTorch achieving an AUC-ROC of [X]%, directly preserving $[Y] in ARR.',
        'Architected end-to-end data pipeline processing [X] TB of daily streaming events via Kafka and PySpark into Snowflake.',
        'Deployed enterprise RAG system with local vector retrieval, accelerating support team search resolution by [X]%.',
        'Engineered automated ETL workflows using dbt, decreasing reporting data latency from [X] hours to under [Y] minutes.'
      ]
    },
    resumeWritingGuidance: {
      summaryStrategy: 'Lead with specialization (Data Engineering, Predictive Modeling, GenAI/LLMs), dataset scales handled, and validated model lift metrics.',
      keySectionsRecommended: ['Professional Summary', 'Technical Skills (Languages, Frameworks, ML/AI, Big Data, BI)', 'Work Experience', 'Published Papers / Key Repositories', 'Education'],
      commonPitfalls: ['Listing academic theory without business impact', 'Omitting test/validation metrics (e.g. F1, AUC, latency, data volumes)']
    },
    exampleJobDescriptions: [
      {
        title: 'Machine Learning Engineer',
        company: 'Cognitive Dynamics',
        requiredExperienceYears: 3,
        requiredQualifications: ['3+ years shipping production machine learning models in Python', 'Strong proficiency with PyTorch, Scikit-Learn, and SQL', 'Experience with containerized model serving using FastAPI and Docker'],
        preferredQualifications: ['Familiarity with LangChain/LlamaIndex and RAG architecture', 'Experience with BigQuery or Snowflake data warehouses']
      }
    ]
  },
  {
    id: 'cybersecurity',
    displayName: 'Cybersecurity',
    description: 'Information security, threat intelligence, vulnerability management, penetration testing, incident response, and regulatory compliance.',
    category: 'Technology',
    seniorityLevels: ['Security Analyst (SOC L1/L2)', 'Security Engineer', 'Penetration Tester', 'Senior Threat Hunter', 'Security Architect', 'CISO'],
    jobTitles: [
      { title: 'Information Security Analyst', level: 'Mid-Level', alternativeTitles: ['SOC Analyst', 'Cybersecurity Specialist', 'Security Operations Analyst'] },
      { title: 'Security Engineer', level: 'Mid-Level', alternativeTitles: ['AppSec Engineer', 'Cloud Security Engineer', 'Network Security Engineer'] },
      { title: 'Penetration Tester', level: 'Mid-Level', alternativeTitles: ['Ethical Hacker', 'Red Team Specialist', 'Vulnerability Assessment Engineer'] },
      { title: 'Incident Responder', level: 'Senior', alternativeTitles: ['DFIR Specialist', 'Security Incident Manager', 'Threat Hunter'] },
      { title: 'Chief Information Security Officer (CISO)', level: 'Lead / Staff', alternativeTitles: ['Head of Security', 'VP of Information Security', 'Director of Cyber Defense'] }
    ],
    skills: {
      technicalSkills: [
        { name: 'SIEM & Log Analysis', category: 'Security Monitoring', synonyms: ['Splunk', 'Microsoft Sentinel', 'QRadar', 'Elastic SIEM'], importance: 'High' },
        { name: 'Incident Response & DFIR', category: 'Incident Management', synonyms: ['Digital Forensics', 'Memory Forensics', 'Chain of Custody', 'Wireshark'], importance: 'High' },
        { name: 'Vulnerability Assessment', category: 'Threat Management', synonyms: ['Nessus', 'Qualys', 'Rapid7', 'Burp Suite', 'OWASP Top 10'], importance: 'High' },
        { name: 'Penetration Testing & Red Teaming', category: 'Ethical Hacking', synonyms: ['Metasploit', 'Kali Linux', 'Cobalt Strike', 'Nmap'], importance: 'High' },
        { name: 'Identity & Access Management (IAM)', category: 'Access Control', synonyms: ['Active Directory', 'Okta', 'OAuth2', 'SAML', 'RBAC', 'MFA'], importance: 'High' },
        { name: 'Cloud Security', category: 'Infrastructure Security', synonyms: ['AWS GuardDuty', 'Security Hub', 'CSPM', 'Prisma Cloud'], importance: 'High' },
        { name: 'Regulatory Compliance', category: 'Governance & Risk', synonyms: ['SOC 2', 'ISO 27001', 'HIPAA', 'PCI-DSS', 'NIST CSF', 'GDPR'], importance: 'High' },
        { name: 'Firewalls & Network Security', category: 'Network Defense', synonyms: ['Palo Alto Networks', 'Fortinet', 'Cisco ASA', 'IDS/IPS'], importance: 'High' }
      ],
      toolsAndPlatforms: [
        { name: 'Splunk', synonyms: ['Splunk Enterprise', 'Splunk Cloud'] },
        { name: 'Burp Suite', synonyms: ['Burp Suite Professional'] },
        { name: 'Qualys', synonyms: ['QualysGuard', 'Qualys VMDR'] },
        { name: 'CrowdStrike Falcon', synonyms: ['CrowdStrike', 'EDR'] }
      ],
      domainTerminology: [
        'Zero-trust architecture (ZTA)', 'MITRE ATT&CK framework', 'Defense in depth',
        'Privilege escalation & lateral movement', 'Indicators of Compromise (IoCs)', 'Mean Time to Detect (MTTD)'
      ],
      softSkills: ['Crisis Management', 'Analytical Forensic Thinking', 'Audit & Compliance Communication', 'Ethical Integrity', 'Collaborative Remediation']
    },
    commonCertifications: ['CISSP (Certified Information Systems Security Professional)', 'CEH (Certified Ethical Hacker)', 'CompTIA Security+', 'OSCP (Offensive Security Certified Professional)', 'CISM (Certified Information Security Manager)'],
    commonQualifications: ["Bachelor's in Cybersecurity, Computer Science, Information Assurance, or equivalent verified industry accreditation"],
    achievementPatterns: {
      actionVerbs: ['Investigated', 'Mitigated', 'Neutralized', 'Hardened', 'Audited', 'Monitored', 'Secured', 'Remediated'],
      metricTemplates: [
        'Conducted enterprise vulnerability assessments across [X] IP assets and servers, identifying and remediating [Y] critical CVEs.',
        'Led SOC incident response team reducing Mean Time to Detect (MTTD) from [X] hours to [Y] minutes.',
        'Spearheaded enterprise SOC 2 Type II and ISO 27001 certification audit preparation, achieving 100% compliance on initial audit.',
        'Architected and implemented multi-factor authentication (MFA) and zero-trust conditional access across [X] global employee accounts.'
      ]
    },
    resumeWritingGuidance: {
      summaryStrategy: 'Prominently display gold-standard security certifications (CISSP, CEH, OSCP), security domain focus, and threat mitigation records.',
      keySectionsRecommended: ['Summary', 'Security Certifications', 'Security Domain Skills', 'Professional Experience', 'Education'],
      commonPitfalls: ['Violating NDAs by naming proprietary vulnerabilities or internal host details', 'Failing to mention recognized frameworks (NIST, MITRE)']
    },
    exampleJobDescriptions: [
      {
        title: 'Information Security Engineer',
        company: 'Fortress Defense Systems',
        requiredExperienceYears: 4,
        requiredQualifications: ['4+ years in SOC analysis, incident response, or cloud security engineering', 'Expertise with Splunk or Sentinel SIEM log correlation', 'Hands-on knowledge of MITRE ATT&CK and NIST cybersecurity frameworks'],
        preferredQualifications: ['Active CISSP or CompTIA CySA+ certification', 'Experience automating security tasks with Python or Bash']
      }
    ]
  },
  {
    id: 'sales-business-dev',
    displayName: 'Sales and Business Development',
    description: 'B2B/B2C sales, enterprise account management, revenue generation, pipeline prospecting, negotiation, and client retention.',
    category: 'Sales & Business',
    seniorityLevels: ['Sales Development Representative (SDR)', 'Account Executive (AE)', 'Senior Account Executive', 'Enterprise Sales Director', 'VP of Global Sales'],
    jobTitles: [
      { title: 'Account Executive', level: 'Mid-Level', alternativeTitles: ['Inside Sales Representative', 'B2B Sales Representative', 'Commercial AE'] },
      { title: 'Sales Development Representative (SDR)', level: 'Entry / Junior', alternativeTitles: ['Business Development Representative (BDR)', 'Outbound Prospector'] },
      { title: 'Enterprise Account Executive', level: 'Senior', alternativeTitles: ['Strategic Accounts Manager', 'Major Accounts Executive', 'Key Account Executive'] },
      { title: 'Business Development Manager', level: 'Mid-Level', alternativeTitles: ['BDM', 'Partnership Manager', 'Alliance Manager'] },
      { title: 'Director of Sales', level: 'Lead / Staff', alternativeTitles: ['VP of Sales', 'Head of Business Development', 'Chief Revenue Officer (CRO)'] }
    ],
    skills: {
      technicalSkills: [
        { name: 'CRM Administration', category: 'Sales Tooling', synonyms: ['Salesforce', 'HubSpot CRM', 'Pipedrive', 'Zoho CRM'], importance: 'High' },
        { name: 'Sales Pipeline Management', category: 'Sales Operations', synonyms: ['Pipeline Forecasting', 'Deal Qualification', 'Sales Funnel'], importance: 'High' },
        { name: 'Prospecting & Lead Generation', category: 'Business Development', synonyms: ['Outbound Prospecting', 'Cold Calling', 'Email Outreach', 'Apollo.io', 'ZoomInfo'], importance: 'High' },
        { name: 'Enterprise Contract Negotiation', category: 'Deal Execution', synonyms: ['Contract Closing', 'Pricing Strategies', 'RFP Responses', 'Commercial Terms'], importance: 'High' },
        { name: 'Sales Methodologies', category: 'Methodology', synonyms: ['MEDDIC', 'BANT', 'SPIN Selling', 'Challenger Sale'], importance: 'High' },
        { name: 'Customer Relationship Management', category: 'Account Management', synonyms: ['Client Retention', 'Account Expansion', 'Upselling', 'Cross-selling'], importance: 'High' }
      ],
      toolsAndPlatforms: [
        { name: 'Salesforce', synonyms: ['SFDC', 'Sales Cloud'] },
        { name: 'HubSpot', synonyms: ['HubSpot Sales Hub'] },
        { name: 'LinkedIn Sales Navigator', synonyms: ['Sales Nav'] },
        { name: 'Outreach / Salesloft', synonyms: ['Sales Engagement Platforms'] }
      ],
      domainTerminology: [
        'Annual Recurring Revenue (ARR)', 'Quota attainment percentage', 'Customer Acquisition Cost (CAC)',
        'Lifetime Value (LTV)', 'Average Contract Value (ACV)', 'Sales cycle duration & velocity'
      ],
      softSkills: ['High Persuasion & Negotiation', 'Active Listening', 'Resilience & Grit', 'Executive Presentation', 'Consultative Value-Selling']
    },
    commonCertifications: ['Certified Professional Sales Person (CPSP)', 'Salesforce Certified Administrator', 'HubSpot Inbound Sales Certified', 'MEDDIC Academy Certification'],
    commonQualifications: ["Bachelor's in Business Administration, Marketing, Communications, or proven track record of exceeding revenue targets"],
    achievementPatterns: {
      actionVerbs: ['Generated', 'Negotiated', 'Closed', 'Surpassed', 'Prospected', 'Expanded', 'Cultivated', 'Secured'],
      metricTemplates: [
        'Consistently exceeded annual sales quota, attaining [X]% of target ($[Y] in net new ARR) across [Z] closed-won deals.',
        'Sourced and closed enterprise agreement valued at $[X], the largest commercial contract in corporate division history.',
        'Generated $[X] in verified pipeline through strategic outbound prospecting campaigns across Fortune 500 accounts.',
        'Reduced enterprise sales cycle duration from [X] days to [Y] days by executing structured MEDDIC deal qualification.'
      ]
    },
    resumeWritingGuidance: {
      summaryStrategy: 'Lead with historical quota attainment percentages, total revenue numbers delivered, and target customer profile (SMB/Mid-Market/Enterprise).',
      keySectionsRecommended: ['Summary', 'Key Revenue Achievements (Highlights Box)', 'Sales Experience', 'Methodologies & Tools', 'Education'],
      commonPitfalls: ['Writing job duty descriptions instead of quota numbers', 'Failing to include percentage of quota met and average deal size']
    },
    exampleJobDescriptions: [
      {
        title: 'Senior Enterprise Account Executive',
        company: 'SaaS Horizon Inc',
        requiredExperienceYears: 5,
        requiredQualifications: ['5+ years B2B SaaS software sales experience with verifiable quota overachievement', 'Demonstrated track record closing 6-figure ACV contracts', 'Proficiency with Salesforce and MEDDIC deal qualification'],
        preferredQualifications: ['Domain experience in HR tech or FinTech SaaS', 'Existing network of CIO/CTO contacts in North America']
      }
    ]
  },
  {
    id: 'marketing-advertising',
    displayName: 'Marketing and Advertising',
    description: 'Digital marketing, brand strategy, demand generation, content marketing, SEO/SEM, marketing automation, and paid media.',
    category: 'Sales & Business',
    seniorityLevels: ['Marketing Coordinator', 'Digital Marketing Specialist', 'Content Strategist', 'Growth Marketing Manager', 'VP of Brand & Growth', 'CMO'],
    jobTitles: [
      { title: 'Digital Marketing Specialist', level: 'Mid-Level', alternativeTitles: ['Online Marketing Manager', 'Performance Marketing Specialist', 'Demand Gen Specialist'] },
      { title: 'Growth Marketing Manager', level: 'Mid-Level', alternativeTitles: ['User Acquisition Manager', 'Growth Hacker', 'Performance Marketing Manager'] },
      { title: 'SEO / SEM Specialist', level: 'Mid-Level', alternativeTitles: ['Search Engine Optimization Specialist', 'PPC Manager', 'Search Strategist'] },
      { title: 'Content Marketing Manager', level: 'Mid-Level', alternativeTitles: ['Content Strategist', 'Editorial Manager', 'Copywriter & Content Lead'] },
      { title: 'Chief Marketing Officer (CMO)', level: 'Lead / Staff', alternativeTitles: ['VP of Marketing', 'Head of Brand Strategy', 'Global Marketing Director'] }
    ],
    skills: {
      technicalSkills: [
        { name: 'Search Engine Optimization (SEO)', category: 'Organic Growth', synonyms: ['Technical SEO', 'Keyword Research', 'Ahrefs', 'SEMrush'], importance: 'High' },
        { name: 'Paid Search & Social (SEM/PPC)', category: 'Paid Media', synonyms: ['Google Ads', 'Meta Ads Manager', 'LinkedIn Ads', 'PPC Campaigns'], importance: 'High' },
        { name: 'Web Analytics & Tagging', category: 'Analytics', synonyms: ['Google Analytics 4 (GA4)', 'Google Tag Manager', 'Mixpanel', 'Amplitude'], importance: 'High' },
        { name: 'Marketing Automation & Email', category: 'Retention & Email', synonyms: ['HubSpot Marketing', 'Marketo', 'Klaviyo', 'Mailchimp', 'Customer.io'], importance: 'High' },
        { name: 'Conversion Rate Optimization (CRO)', category: 'Optimization', synonyms: ['A/B Testing', 'Landing Page Optimization', 'Optimizely', 'Unbounce'], importance: 'High' },
        { name: 'Content Marketing Strategy', category: 'Content & Editorial', synonyms: ['Blog Strategy', 'Whitepapers', 'Case Studies', 'Brand Storytelling'], importance: 'High' }
      ],
      toolsAndPlatforms: [
        { name: 'Google Ads', synonyms: ['Google AdWords'] },
        { name: 'Google Analytics 4', synonyms: ['GA4', 'Universal Analytics Migration'] },
        { name: 'Ahrefs / SEMrush', synonyms: ['SEO Suites'] },
        { name: 'Marketo / HubSpot', synonyms: ['Marketing Automation'] }
      ],
      domainTerminology: [
        'Cost Per Acquisition (CPA)', 'Return on Ad Spend (ROAS)', 'Click-Through Rate (CTR)',
        'Marketing Qualified Leads (MQLs)', 'Customer Acquisition Cost (CAC)', 'Organic organic impressions'
      ],
      softSkills: ['Creative Brand Vision', 'Data-Driven Decision Making', 'Storytelling & Copywriting', 'Campaign Project Management', 'Cross-Functional Collaboration']
    },
    commonCertifications: ['Google Ads Certified Professional', 'Google Analytics Individual Qualification (GAIQ)', 'HubSpot Inbound Marketing Certification', 'Meta Certified Digital Marketing Associate'],
    commonQualifications: ["Bachelor's in Marketing, Communications, Advertising, Business, or proven commercial campaign execution portfolio"],
    achievementPatterns: {
      actionVerbs: ['Orchestrated', 'Scaled', 'Spearheaded', 'Optimized', 'Launched', 'Generated', 'Acquired', 'Produced'],
      metricTemplates: [
        'Scaled organic inbound traffic by [X]% year-over-year through targeted technical SEO enhancements and keyword clusters.',
        'Managed $[X]k monthly paid ad budget across Google and Meta, generating [Y] MQLs at a [Z]% reduction in CPA.',
        'Executed automated email nurture campaign in HubSpot, boosting email-to-pipeline conversion rate by [X]%.',
        'Increased landing page conversion rate from [X]% to [Y]% through structured multivariate A/B testing.'
      ]
    },
    resumeWritingGuidance: {
      summaryStrategy: 'Focus on growth metrics, budget managed, CAC/ROAS efficiencies, and key channel specializations.',
      keySectionsRecommended: ['Summary', 'Core Marketing Competencies', 'Marketing Campaigns & Experience', 'Tools & Certifications', 'Education'],
      commonPitfalls: ['Focusing entirely on activities (e.g. wrote posts) rather than outcomes (traffic, leads, conversions, ROAS)']
    },
    exampleJobDescriptions: [
      {
        title: 'Performance Marketing Manager',
        company: 'Nova Growth Brands',
        requiredExperienceYears: 4,
        requiredQualifications: ['4+ years managing multi-channel paid acquisition across Google and Meta Ads', 'Expert proficiency in Google Analytics 4 (GA4) and Google Tag Manager', 'Demonstrated record managing >$100k/mo ad spend profitably'],
        preferredQualifications: ['Experience with B2B lead generation via LinkedIn Ads', 'HubSpot or Marketo marketing automation certification']
      }
    ]
  },
  {
    id: 'customer-service-support',
    displayName: 'Customer Service and Technical Support',
    description: 'Client onboarding, technical support, helpdesk administration, customer success, ticket resolution, and client advocacy.',
    category: 'Service & Support',
    seniorityLevels: ['Helpdesk Technician L1', 'Customer Support Representative', 'Technical Support Specialist L2/L3', 'Customer Success Manager', 'Support Operations Lead', 'VP of Customer Experience'],
    jobTitles: [
      { title: 'Customer Support Specialist', level: 'Mid-Level', alternativeTitles: ['Customer Service Representative', 'Client Support Associate', 'Customer Care Specialist'] },
      { title: 'Technical Support Engineer', level: 'Mid-Level', alternativeTitles: ['Desktop Support Technician', 'Helpdesk Analyst', 'IT Support Specialist'] },
      { title: 'Customer Success Manager (CSM)', level: 'Mid-Level', alternativeTitles: ['Client Success Manager', 'Account Relationship Specialist', 'Onboarding Manager'] },
      { title: 'Support Operations Lead', level: 'Lead / Staff', alternativeTitles: ['Head of Customer Support', 'Support Team Lead', 'Customer Experience Director'] }
    ],
    skills: {
      technicalSkills: [
        { name: 'Helpdesk & Ticketing Systems', category: 'Service Platforms', synonyms: ['Zendesk', 'Jira Service Management', 'Freshdesk', 'ServiceNow'], importance: 'High' },
        { name: 'Hardware & OS Troubleshooting', category: 'IT Diagnostics', synonyms: ['Windows 10/11', 'macOS Support', 'Active Directory', 'Hardware Repairs'], importance: 'High' },
        { name: 'Knowledge Base Management', category: 'Documentation', synonyms: ['KB Authoring', 'FAQ Development', 'Standard Operating Procedures (SOPs)'], importance: 'High' },
        { name: 'SLA Monitoring & Compliance', category: 'Support Operations', synonyms: ['First Contact Resolution (FCR)', 'Mean Time to Resolution (MTTR)', 'SLA Enforcement'], importance: 'High' },
        { name: 'Customer Satisfaction Management', category: 'Client Experience', synonyms: ['CSAT', 'NPS', 'Customer Advocacy', 'Conflict De-escalation'], importance: 'High' }
      ],
      toolsAndPlatforms: [
        { name: 'Zendesk', synonyms: ['Zendesk Support', 'Zendesk Guide'] },
        { name: 'ServiceNow', synonyms: ['ServiceNow IT Service Management'] },
        { name: 'Jira Service Management', synonyms: ['Jira Service Desk'] }
      ],
      domainTerminology: [
        'First Response Time (FRT)', 'Customer Effort Score (CES)', 'Net Promoter Score (NPS)',
        'Ticket escalation hierarchy', 'Root cause ticketing categorization'
      ],
      softSkills: ['Empathetic Listening', 'De-escalation of Frustrated Clients', 'Clear Non-Technical Communication', 'Patience & Composure', 'Time Management']
    },
    commonCertifications: ['CompTIA A+', 'CompTIA Network+', 'ITIL Foundation v4', 'Zendesk Support Certified Administrator', 'Microsoft Certified: Modern Desktop Administrator Associate'],
    commonQualifications: ["Associate or Bachelor's degree or equivalent technical troubleshooting work experience"],
    achievementPatterns: {
      actionVerbs: ['Resolved', 'Troubleshot', 'Trained', 'Streamlined', 'De-escalated', 'Onboarded', 'Documented', 'Standardized'],
      metricTemplates: [
        'Maintained a [X]% average CSAT rating across [Y]+ resolved support tickets per month, exceeding team target by [Z]%.',
        'Decreased First Contact Resolution (FCR) turnaround time from [X] hours to [Y] minutes by compiling a comprehensive 50-article internal knowledge base.',
        'Successfully managed technical onboarding for [X] enterprise accounts, achieving a [Y]% 90-day retention rate.',
        'Supported [X]+ corporate endpoints across Windows and macOS environments with 99.8% SLA compliance.'
      ]
    },
    resumeWritingGuidance: {
      summaryStrategy: 'Emphasize CSAT/NPS scores, volume of tickets resolved per day/month, and ticketing software expertise.',
      keySectionsRecommended: ['Summary', 'Core Support Strengths', 'Professional Experience', 'Technical Tools & Certifications', 'Education'],
      commonPitfalls: ['Writing generic descriptions without ticket volumes, CSAT metrics, or SLA adherence percentages']
    },
    exampleJobDescriptions: [
      {
        title: 'Technical Support Specialist L2',
        company: 'Apex Cloud Solutions',
        requiredExperienceYears: 2,
        requiredQualifications: ['2+ years providing Tier 2 software/IT support using Zendesk or ServiceNow', 'Proven ability to troubleshoot web applications, REST APIs, and basic networking', 'Consistent historical CSAT scores above 95%'],
        preferredQualifications: ['CompTIA A+ or ITIL v4 certification', 'Basic familiarity with SQL queries for log inspection']
      }
    ]
  },
  {
    id: 'finance-accounting',
    displayName: 'Finance and Accounting',
    description: 'Corporate accounting, financial planning & analysis (FP&A), auditing, taxation, general ledger, reporting, and financial controls.',
    category: 'Finance & Banking',
    seniorityLevels: ['Staff Accountant', 'Financial Analyst', 'Senior Accountant', 'Accounting Manager', 'Finance Director', 'CFO'],
    jobTitles: [
      { title: 'Financial Analyst', level: 'Mid-Level', alternativeTitles: ['FP&A Analyst', 'Corporate Financial Analyst', 'Budget Analyst'] },
      { title: 'Senior Accountant', level: 'Senior', alternativeTitles: ['Senior Staff Accountant', 'General Ledger Accountant', 'Senior Financial Accountant'] },
      { title: 'Accounting Manager', level: 'Lead / Staff', alternativeTitles: ['Assistant Controller', 'Audit Manager', 'Financial Reporting Manager'] },
      { title: 'Corporate Controller', level: 'Principal / Architect', alternativeTitles: ['Head of Accounting', 'Director of Financial Reporting', 'Financial Controller'] },
      { title: 'Chief Financial Officer (CFO)', level: 'Principal / Architect', alternativeTitles: ['VP of Finance', 'Treasurer', 'Finance Director'] }
    ],
    skills: {
      technicalSkills: [
        { name: 'GAAP / IFRS Compliance', category: 'Accounting Standards', synonyms: ['US GAAP', 'IFRS', 'Financial Reporting Standards'], importance: 'High' },
        { name: 'Financial Planning & Analysis (FP&A)', category: 'Financial Strategy', synonyms: ['Budgeting', 'Forecasting', 'Variance Analysis', 'Scenario Modeling'], importance: 'High' },
        { name: 'ERP Systems', category: 'Accounting Software', synonyms: ['NetSuite', 'SAP ERP', 'Oracle Financials', 'QuickBooks Online'], importance: 'High' },
        { name: 'Advanced Excel & Financial Modeling', category: 'Analytics Tooling', synonyms: ['DCF Modeling', 'VLOOKUP / XLOOKUP', 'Pivot Tables', 'Index Match', 'Macros'], importance: 'High' },
        { name: 'General Ledger & Month-End Close', category: 'Accounting Operations', synonyms: ['GL Reconciliations', 'Accruals', 'Journal Entries', 'Fixed Assets'], importance: 'High' },
        { name: 'Tax Compliance & Audit Preparation', category: 'Compliance', synonyms: ['Internal Controls', 'SOX 404', 'Corporate Tax Filings', 'Statutory Audit'], importance: 'High' }
      ],
      toolsAndPlatforms: [
        { name: 'NetSuite', synonyms: ['Oracle NetSuite ERP'] },
        { name: 'SAP ERP', synonyms: ['SAP S/4HANA Finance'] },
        { name: 'QuickBooks', synonyms: ['QuickBooks Pro / Online'] },
        { name: 'Tableau / Power BI', synonyms: ['Financial Dashboards'] }
      ],
      domainTerminology: [
        'EBITDA & Operating Cash Flow', 'Working Capital management', 'Variance analysis vs forecast',
        'Sarbanes-Oxley (SOX) compliance', 'Chart of Accounts (CoA)', 'Depreciation & Amortization'
      ],
      softSkills: ['Meticulous Attention to Detail', 'Ethical Governance', 'Executive Financial Storytelling', 'Cross-Department Budget Partnering']
    },
    commonCertifications: ['CPA (Certified Public Accountant)', 'CFA (Chartered Financial Analyst)', 'CMA (Certified Management Accountant)', 'ACCA (Association of Chartered Certified Accountants)'],
    commonQualifications: ["Bachelor's or Master's in Accounting, Finance, Economics, or Business Administration"],
    achievementPatterns: {
      actionVerbs: ['Reconciled', 'Forecasted', 'Audited', 'Streamlined', 'Analyzed', 'Formulated', 'Reduced', 'Structured'],
      metricTemplates: [
        'Spearheaded month-end close acceleration, reducing close cycle duration from [X] business days to [Y] days.',
        'Constructed multi-scenario 5-year financial model that identified $[X]M in redundant operational expenditures.',
        'Led external audit readiness for big-4 accounting firm, yielding zero material deficiencies across $[X]M in assets.',
        'Managed general ledger reconciliations across [X] subsidiary entities in NetSuite with 100% balance sheet accuracy.'
      ]
    },
    resumeWritingGuidance: {
      summaryStrategy: 'State CPA/CFA license, total enterprise budget/portfolio managed, ERP systems used, and audit record.',
      keySectionsRecommended: ['Summary', 'Credentials & Licenses (CPA, CFA)', 'Core Accounting/Finance Competencies', 'Experience', 'Education'],
      commonPitfalls: ['Omitting specific GAAP/IFRS standards or naming of ERP systems (SAP, NetSuite, etc.)']
    },
    exampleJobDescriptions: [
      {
        title: 'Senior Financial Analyst (FP&A)',
        company: 'Meridian Capital Group',
        requiredExperienceYears: 4,
        requiredQualifications: ['4+ years in FP&A, corporate finance, or public accounting', 'Advanced Excel financial modeling skills (DCF, scenario planning)', 'Demonstrated proficiency with NetSuite or SAP and BI reporting tools'],
        preferredQualifications: ['CPA or CFA designation or candidacy', 'Experience supporting executive forecasting in high-growth companies']
      }
    ]
  },
  {
    id: 'banking-insurance',
    displayName: 'Banking and Insurance',
    description: 'Commercial banking, retail branch operations, underwriting, loan origination, wealth management, claims processing, and risk management.',
    category: 'Finance & Banking',
    seniorityLevels: ['Bank Teller / Associate', 'Loan Officer / Underwriter', 'Senior Claims Adjuster', 'Wealth Management Advisor', 'Branch Manager', 'VP of Lending'],
    jobTitles: [
      { title: 'Commercial Loan Officer', level: 'Mid-Level', alternativeTitles: ['Loan Originator', 'Mortgage Loan Specialist', 'Credit Analyst'] },
      { title: 'Underwriter', level: 'Mid-Level', alternativeTitles: ['Mortgage Underwriter', 'Commercial Credit Underwriter', 'Insurance Underwriter'] },
      { title: 'Claims Adjuster', level: 'Mid-Level', alternativeTitles: ['Insurance Claims Specialist', 'Claims Examiner', 'Loss Adjuster'] },
      { title: 'Branch Manager', level: 'Lead / Staff', alternativeTitles: ['Retail Banking Manager', 'Banking Operations Manager'] },
      { title: 'Wealth Management Advisor', level: 'Mid-Level', alternativeTitles: ['Financial Advisor', 'Private Banker', 'Portfolio Manager'] }
    ],
    skills: {
      technicalSkills: [
        { name: 'Credit Analysis & Underwriting', category: 'Credit Assessment', synonyms: ['Debt-to-Income (DTI)', 'Loan-to-Value (LTV)', 'Credit Scoring', 'Financial Statement Analysis'], importance: 'High' },
        { name: 'Regulatory Banking Compliance', category: 'Compliance', synonyms: ['Anti-Money Laundering (AML)', 'Know Your Customer (KYC)', 'Bank Secrecy Act (BSA)', 'Dodd-Frank'], importance: 'High' },
        { name: 'Loan Origination Systems (LOS)', category: 'Banking Software', synonyms: ['Encompass', 'Fiserv', 'Jack Henry', 'nCino'], importance: 'High' },
        { name: 'Insurance Claims Processing', category: 'Insurance', synonyms: ['Policy Evaluation', 'Claim Investigation', 'Settlement Negotiation', 'Damage Assessment'], importance: 'High' },
        { name: 'Portfolio & Risk Assessment', category: 'Wealth Management', synonyms: ['Asset Allocation', 'Risk Mitigation', 'Retirement Planning', 'Fiduciary Standards'], importance: 'High' }
      ],
      toolsAndPlatforms: [
        { name: 'Encompass', synonyms: ['ICE Mortgage Technology Encompass'] },
        { name: 'nCino', synonyms: ['nCino Bank Operating System'] },
        { name: 'Fiserv / Jack Henry', synonyms: ['Core Banking Platforms'] }
      ],
      domainTerminology: [
        'Debt-Service Coverage Ratio (DSCR)', 'Suspicious Activity Reports (SAR)', 'Basis Points (BPS)',
        'Loss Ratio & Combined Ratio', 'Amortization schedules', 'Underwriting guidelines'
      ],
      softSkills: ['High Discretion & Confidentiality', 'Client Relationship Building', 'Risk Prudence', 'Regulatory Integrity']
    },
    commonCertifications: ['Certified Regulatory Compliance Manager (CRCM)', 'Chartered Financial Consultant (ChFC)', 'Certified Anti-Money Laundering Specialist (CAMS)', 'FINRA Series 7 and Series 66', 'NMLS License'],
    commonQualifications: ["Bachelor's in Finance, Economics, Business, Risk Management, or required statutory banking/insurance licenses"],
    achievementPatterns: {
      actionVerbs: ['Originated', 'Underwrote', 'Approved', 'Investigated', 'Assessed', 'Audited', 'Advised', 'Processed'],
      metricTemplates: [
        'Originated and closed $[X]M in commercial real estate loans, maintaining a delinquency rate below [Y]%.',
        'Underwrote [X]+ complex mortgage applications per month, sustaining a [Y]% error-free file audit rating.',
        'Processed and settled over [X] property claims totaling $[Y]M with an average turnaround time of [Z] business days.',
        'Achieved 100% compliance on state and federal regulatory audits regarding KYC and AML protocols.'
      ]
    },
    resumeWritingGuidance: {
      summaryStrategy: 'State total loan or portfolio book value originated, underwriting compliance score, and regulatory licenses (NMLS, Series 7).',
      keySectionsRecommended: ['Summary', 'Licensure & Certifications', 'Banking & Underwriting Expertise', 'Experience', 'Education'],
      commonPitfalls: ['Omitting licenses or failure to cite compliance standards like AML/KYC']
    },
    exampleJobDescriptions: [
      {
        title: 'Commercial Credit Underwriter',
        company: 'First Heritage Bank',
        requiredExperienceYears: 3,
        requiredQualifications: ['3+ years in commercial lending credit analysis or underwriting', 'Knowledge of financial statement analysis, debt capacity, and DSCR metrics', 'Working experience with nCino or Encompass loan origination platforms'],
        preferredQualifications: ['Formal commercial credit training program completion', 'Strong knowledge of BSA/AML compliance mandates']
      }
    ]
  },
  {
    id: 'hr-recruitment',
    displayName: 'Human Resources and Recruitment',
    description: 'Talent acquisition, employee relations, onboarding, performance management, HR operations, compliance, compensation and benefits.',
    category: 'Operations & Management',
    seniorityLevels: ['HR Coordinator', 'Talent Acquisition Specialist', 'HR Generalist', 'Senior HR Business Partner (HRBP)', 'Director of Human Resources', 'Chief People Officer (CPO)'],
    jobTitles: [
      { title: 'HR Generalist', level: 'Mid-Level', alternativeTitles: ['Human Resources Specialist', 'People Operations Specialist', 'Staff HR Associate'] },
      { title: 'Technical Recruiter', level: 'Mid-Level', alternativeTitles: ['Talent Acquisition Specialist', 'Corporate Recruiter', 'Headhunter'] },
      { title: 'HR Business Partner (HRBP)', level: 'Senior', alternativeTitles: ['Senior HRBP', 'People Partner', 'Regional HR Manager'] },
      { title: 'Director of Human Resources', level: 'Lead / Staff', alternativeTitles: ['Head of People Operations', 'VP of Talent', 'Chief People Officer (CPO)'] }
    ],
    skills: {
      technicalSkills: [
        { name: 'Human Resource Information Systems (HRIS)', category: 'HR Tech', synonyms: ['Workday', 'BambooHR', 'ADP Workforce Now', 'Rippling'], importance: 'High' },
        { name: 'Applicant Tracking Systems (ATS)', category: 'Recruiting Tech', synonyms: ['Greenhouse', 'Lever', 'Workable', 'iCIMS', 'Jobvite'], importance: 'High' },
        { name: 'Talent Acquisition & Sourcing', category: 'Recruitment', synonyms: ['Full-Cycle Recruiting', 'Boolean Search', 'LinkedIn Recruiter', 'Candidate Pipeline'], importance: 'High' },
        { name: 'Employment Law & Labor Compliance', category: 'Legal Compliance', synonyms: ['EEOC', 'FLSA', 'FMLA', 'ADA', 'Title VII', 'COBRA'], importance: 'High' },
        { name: 'Employee Relations & Conflict Resolution', category: 'People Operations', synonyms: ['Workplace Investigations', 'Performance Improvement Plans (PIPs)', 'Exit Interviews'], importance: 'High' },
        { name: 'Compensation, Benefits & Total Rewards', category: 'Compensation', synonyms: ['Salary Benchmarking', 'Benefits Administration', '401k Plans', 'Healthcare Open Enrollment'], importance: 'High' }
      ],
      toolsAndPlatforms: [
        { name: 'Workday', synonyms: ['Workday HCM'] },
        { name: 'Greenhouse', synonyms: ['Greenhouse ATS'] },
        { name: 'LinkedIn Recruiter', synonyms: ['Recruiter Corporate'] },
        { name: 'BambooHR', synonyms: ['BambooHR Platform'] }
      ],
      domainTerminology: [
        'Time-to-Hire & Cost-per-Hire', 'Employee Net Promoter Score (eNPS)', 'Retention & voluntary turnover rate',
        'Performance management cycles', 'Diversity, Equity, and Inclusion (DEI) benchmarking'
      ],
      softSkills: ['High Discretion & Empathy', 'Executive Coaching', 'Conflict De-escalation', 'Impartial Investigation', 'Organizational Culture Champion']
    },
    commonCertifications: ['SHRM-CP (Society for Human Resource Management Certified Professional)', 'SHRM-SCP', 'PHR (Professional in Human Resources)', 'SPHR (Senior Professional in Human Resources)', 'Talent Acquisition Strategist (TAS)'],
    commonQualifications: ["Bachelor's in Human Resources, Business Administration, Psychology, or recognized SHRM/HRCI accreditation"],
    achievementPatterns: {
      actionVerbs: ['Recruited', 'Implemented', 'Resolved', 'Streamlined', 'Onboarded', 'Benchmarked', 'Administered', 'Cultivated'],
      metricTemplates: [
        'Managed full-cycle recruitment across [X] technical roles per quarter, reducing average Time-to-Fill from [Y] to [Z] days.',
        'Overhauled employee onboarding program across [X] distributed employees, driving 90-day retention to [Y]%.',
        'Implemented Workday HRIS system for [X] employees on schedule, replacing disparate legacy systems.',
        'Conducted [X] workplace grievance investigations with 100% adherence to EEOC guidelines and zero corporate liability findings.'
      ]
    },
    resumeWritingGuidance: {
      summaryStrategy: 'Display SHRM/PHR certification, total employee headcount supported, ATS/HRIS tools used, and hiring metrics.',
      keySectionsRecommended: ['Summary', 'HR Certifications & Affiliations', 'Core People Competencies', 'Professional Experience', 'Education'],
      commonPitfalls: ['Describing HR as administrative paperwork rather than strategic talent and culture initiatives with measurable retention/hiring metrics']
    },
    exampleJobDescriptions: [
      {
        title: 'Senior Human Resources Generalist',
        company: 'Vanguard Global Corp',
        requiredExperienceYears: 4,
        requiredQualifications: ['4+ years in human resources generalist duties supporting 300+ employees', 'Demonstrated knowledge of federal and state labor laws (FLSA, FMLA, EEOC)', 'Hands-on experience managing HRIS in Workday, ADP, or BambooHR'],
        preferredQualifications: ['Active SHRM-CP or PHR certification', 'Experience administering open enrollment benefits and 401(k) programs']
      }
    ]
  },
  {
    id: 'administration-office',
    displayName: 'Administration and Office Management',
    description: 'Executive assistance, office coordination, records management, calendar scheduling, travel logistics, document preparation, and office operations.',
    category: 'Operations & Management',
    seniorityLevels: ['Receptionist', 'Administrative Assistant', 'Office Manager', 'Executive Assistant (EA)', 'Chief of Staff'],
    jobTitles: [
      { title: 'Executive Assistant', level: 'Senior', alternativeTitles: ['EA to CEO', 'Senior Executive Assistant', 'C-Suite Assistant'] },
      { title: 'Office Manager', level: 'Mid-Level', alternativeTitles: ['Office Administrator', 'Facilities Coordinator', 'Workplace Experience Coordinator'] },
      { title: 'Administrative Assistant', level: 'Entry / Junior', alternativeTitles: ['Admin Assistant', 'Office Coordinator', 'Clerical Specialist'] }
    ],
    skills: {
      technicalSkills: [
        { name: 'Calendar & Schedule Management', category: 'Administrative Coordination', synonyms: ['Complex Scheduling', 'Google Calendar', 'Outlook Calendar', 'Time Zone Management'], importance: 'High' },
        { name: 'Travel Coordination & Logistics', category: 'Logistics', synonyms: ['Itinerary Planning', 'Flight & Hotel Booking', 'Concur', 'Corporate Travel'], importance: 'High' },
        { name: 'Office Software Suites', category: 'Software Tools', synonyms: ['Microsoft Office 365', 'Google Workspace', 'Word', 'Excel', 'PowerPoint'], importance: 'High' },
        { name: 'Expense Reporting & Reconciliation', category: 'Finance Support', synonyms: ['Expensify', 'Concur Expense', 'Credit Card Reconciliation', 'Invoicing'], importance: 'High' },
        { name: 'Meeting Minutes & Documentation', category: 'Documentation', synonyms: ['Board Deck Preparation', 'Agenda Setting', 'Confidential Transcriptions'], importance: 'High' }
      ],
      toolsAndPlatforms: [
        { name: 'Microsoft 365 / Outlook', synonyms: ['MS Office Suite'] },
        { name: 'Google Workspace', synonyms: ['G Suite', 'Gmail', 'Google Docs'] },
        { name: 'Concur / Expensify', synonyms: ['Travel and Expense Management'] }
      ],
      domainTerminology: [
        'Gatekeeping & priority triage', 'Complex multi-leg travel itineraries', 'Vendor contract management',
        'C-Suite confidential correspondence', 'Facility safety protocols'
      ],
      softSkills: ['Extreme Discretion & Trustworthiness', 'Proactive Anticipation of Needs', 'Composure Under Pressure', 'Punctual Reliability']
    },
    commonCertifications: ['Certified Administrative Professional (CAP)', 'Microsoft Office Specialist (MOS) Expert', 'Certified Executive Assistant (CEA)'],
    commonQualifications: ["High School diploma, Associate or Bachelor's degree with extensive executive support history"],
    achievementPatterns: {
      actionVerbs: ['Coordinated', 'Organized', 'Streamlined', 'Scheduled', 'Prepared', 'Managed', 'Facilitated', 'Reconciled'],
      metricTemplates: [
        'Provided high-level administrative support to [X] C-suite executives, flawlessly managing complex global calendars across [Y] time zones.',
        'Negotiated office supplies and facility vendor agreements, reducing annual operating expenses by [X]%.',
        'Coordinated international travel itineraries and visa logistics for [X] annual executive board trips with zero delays.',
        'Processed over $[X]k in monthly expense reports using Expensify with 100% compliance to corporate policy.'
      ]
    },
    resumeWritingGuidance: {
      summaryStrategy: 'State level of leaders supported (e.g. CEO, VP, Board), scheduling volume, discretion, and office efficiency enhancements.',
      keySectionsRecommended: ['Summary', 'Administrative Expertise', 'Professional Experience', 'Software Proficiencies', 'Education'],
      commonPitfalls: ['Failing to highlight confidential gatekeeping or executive communication responsibilities']
    },
    exampleJobDescriptions: [
      {
        title: 'Executive Assistant to the CEO',
        company: 'Summit Capital Partners',
        requiredExperienceYears: 4,
        requiredQualifications: ['4+ years supporting senior executives (C-Suite or Board level)', 'Mastery of Google Workspace and Microsoft 365 scheduling tools', 'Proven ability to manage confidential business affairs with complete discretion'],
        preferredQualifications: ['Experience coordinating complex international multi-city travel', 'Bachelor’s degree in Business Administration or Communications']
      }
    ]
  },
  {
    id: 'operations-logistics',
    displayName: 'Operations and Logistics',
    description: 'Supply chain management, warehouse operations, procurement, inventory control, distribution, fleet routing, and continuous process improvement.',
    category: 'Operations & Management',
    seniorityLevels: ['Logistics Coordinator', 'Warehouse Supervisor', 'Supply Chain Analyst', 'Operations Manager', 'Director of Supply Chain', 'VP of Global Operations'],
    jobTitles: [
      { title: 'Operations Manager', level: 'Senior', alternativeTitles: ['Director of Operations', 'General Operations Manager', 'Business Operations Lead'] },
      { title: 'Supply Chain Analyst', level: 'Mid-Level', alternativeTitles: ['Logistics Analyst', 'Procurement Specialist', 'Inventory Planner'] },
      { title: 'Warehouse Operations Supervisor', level: 'Mid-Level', alternativeTitles: ['Fulfillment Manager', 'Distribution Center Supervisor', 'Inventory Manager'] }
    ],
    skills: {
      technicalSkills: [
        { name: 'Supply Chain Planning & Sourcing', category: 'Supply Chain', synonyms: ['Vendor Management', 'Procurement', 'Purchase Orders (PO)', 'Supplier Relations'], importance: 'High' },
        { name: 'Inventory Control & Warehouse Management', category: 'Warehousing', synonyms: ['WMS', 'Warehouse Management Systems', 'Cycle Counts', 'FIFO', 'SKU Management'], importance: 'High' },
        { name: 'Lean / Six Sigma Methodologies', category: 'Process Improvement', synonyms: ['Kaizen', 'Continuous Improvement', '5S', 'Root Cause Analysis', 'DMAIC'], importance: 'High' },
        { name: 'Logistics, Freight & Distribution', category: 'Logistics', synonyms: ['Freight Forwarding', 'Bill of Lading (BOL)', '3PL Management', 'DOT Compliance'], importance: 'High' },
        { name: 'ERP & Operations Platforms', category: 'Operations Tech', synonyms: ['SAP SCM', 'Oracle SCM', 'Manhattan Associates', 'Fishbowl'], importance: 'High' }
      ],
      toolsAndPlatforms: [
        { name: 'SAP SCM', synonyms: ['SAP Supply Chain Management'] },
        { name: 'Manhattan Associates WMS', synonyms: ['Manhattan WMS'] },
        { name: 'Microsoft Excel / Power BI', synonyms: ['Supply Chain Analytics'] }
      ],
      domainTerminology: [
        'On-Time In-Full (OTIF) delivery rate', 'Order lead times & safety stock calculation',
        'Economic Order Quantity (EOQ)', 'Inventory turnover ratio', 'Standard Operating Procedures (SOPs)'
      ],
      softSkills: ['Decisive Tactical Problem-Solving', 'Cross-Functional Logistics Orchestration', 'Team Leadership Across Shifts', 'Vendor Negotiation']
    },
    commonCertifications: ['APICS CSCP (Certified Supply Chain Professional)', 'APICS CPIM (Certified in Planning and Inventory Management)', 'Six Sigma Green Belt / Black Belt', 'PMP (Project Management Professional)'],
    commonQualifications: ["Bachelor's in Supply Chain Management, Logistics, Industrial Engineering, or Business Administration"],
    achievementPatterns: {
      actionVerbs: ['Optimized', 'Streamlined', 'Negotiated', 'Directed', 'Supervised', 'Consolidated', 'Reduced', 'Standardized'],
      metricTemplates: [
        'Overhauled warehouse pick-pack fulfillment routing, improving order fulfillment speed by [X]% across [Y] daily shipments.',
        'Negotiated 3PL freight carrier contracts, securing a [X]% rate discount while elevating On-Time Delivery (OTD) to [Y]%.',
        'Reduced inventory carrying costs by $[X]k by introducing automated reorder points and cycle count procedures.',
        'Implemented 5S and Lean manufacturing principles, decreasing workplace distribution incidents by [X]%.'
      ]
    },
    resumeWritingGuidance: {
      summaryStrategy: 'Lead with scale of warehouse/fleet/budget managed, OTIF delivery rate improvements, and Lean/Six Sigma credentials.',
      keySectionsRecommended: ['Summary', 'Operations & Supply Chain Certifications', 'Core Operational Strengths', 'Experience', 'Education'],
      commonPitfalls: ['Omitting specific WMS/ERP platforms or failing to quantify inventory reductions or delivery percentages']
    },
    exampleJobDescriptions: [
      {
        title: 'Supply Chain Operations Manager',
        company: 'Pioneer Logistics International',
        requiredExperienceYears: 5,
        requiredQualifications: ['5+ years in supply chain operations, logistics, or distribution management', 'Demonstrated mastery of WMS platforms and inventory control methods', 'Proven track record optimizing carrier freight costs and OTIF delivery rates'],
        preferredQualifications: ['APICS CSCP or Six Sigma Green Belt certification', 'Experience implementing automated barcode scanning and RFID tracking']
      }
    ]
  },
  {
    id: 'retail-ecommerce',
    displayName: 'Retail and E-commerce',
    description: 'Online store management, merchandising, catalog optimization, marketplace operations (Amazon, Shopify), store management, and omnichannel retail.',
    category: 'Sales & Business',
    seniorityLevels: ['Retail Sales Associate', 'E-commerce Specialist', 'Assistant Store Manager', 'E-commerce Operations Manager', 'Store Manager', 'VP of Retail & Digital'],
    jobTitles: [
      { title: 'E-commerce Manager', level: 'Senior', alternativeTitles: ['Online Store Manager', 'Digital Merchandising Manager', 'Amazon Marketplace Specialist'] },
      { title: 'Retail Store Manager', level: 'Mid-Level', alternativeTitles: ['General Store Manager', 'Retail Operations Manager', 'Shop Manager'] },
      { title: 'E-commerce Catalog Specialist', level: 'Mid-Level', alternativeTitles: ['Product Listing Specialist', 'Digital Merchandiser', 'Shopify Specialist'] }
    ],
    skills: {
      technicalSkills: [
        { name: 'E-commerce Platforms', category: 'Platforms', synonyms: ['Shopify', 'Shopify Plus', 'Magento', 'WooCommerce', 'BigCommerce'], importance: 'High' },
        { name: 'Marketplace Operations', category: 'Marketplaces', synonyms: ['Amazon Seller Central', 'Amazon Vendor Central', 'eBay', 'Walmart Marketplace'], importance: 'High' },
        { name: 'Product Merchandising & Listing Optimization', category: 'Merchandising', synonyms: ['A+ Content', 'Product Descriptions', 'SEO Listings', 'Category Management'], importance: 'High' },
        { name: 'Inventory & Order Management', category: 'Fulfillment', synonyms: ['ShipStation', 'FBA (Fulfillment by Amazon)', 'Order Tracking', 'Stock Reordering'], importance: 'High' },
        { name: 'Retail Store Operations', category: 'Store Management', synonyms: ['POS Systems', 'Visual Merchandising', 'Loss Prevention', 'Cash Handling'], importance: 'High' }
      ],
      toolsAndPlatforms: [
        { name: 'Shopify Plus', synonyms: ['Shopify Store'] },
        { name: 'Amazon Seller Central', synonyms: ['FBA Management'] },
        { name: 'ShipStation', synonyms: ['E-commerce Shipping'] }
      ],
      domainTerminology: [
        'Average Order Value (AOV)', 'Gross Merchandise Value (GMV)', 'Conversion Rate (CVR)',
        'Cart abandonment rate', 'FBA inventory performance index (IPI)'
      ],
      softSkills: ['Customer Empathy', 'Visual Aesthetic Merchandising', 'Multi-tasking Retail Floor Leadership', 'Vendor Communication']
    },
    commonCertifications: ['Shopify Certified Partner', 'Amazon Advertising Certification', 'National Retail Federation (NRF) Customer Service Certification'],
    commonQualifications: ["Bachelor's in Marketing, Business, Fashion Merchandising, or extensive hands-on store/e-commerce track record"],
    achievementPatterns: {
      actionVerbs: ['Expanded', 'Merchandised', 'Boosted', 'Optimized', 'Managed', 'Supervised', 'Launched', 'Generated'],
      metricTemplates: [
        'Scaled direct-to-consumer Shopify store revenue from $[X]k to $[Y]M in 18 months, boosting Average Order Value (AOV) by [Z]%.',
        'Managed catalog of [X]+ SKUs across Amazon Seller Central, maintaining an account health rating of [Y]% and Amazon Buy Box share of [Z]%.',
        'Led retail staff of [X] associates, consistently surpassing monthly store revenue sales goals by [Y]%.',
        'Reduced checkout cart abandonment rate from [X]% to [Y]% through frictionless payment gateway integration.'
      ]
    },
    resumeWritingGuidance: {
      summaryStrategy: 'Highlight total GMV or store sales generated, platform expertise (Shopify, Amazon), and AOV/conversion improvements.',
      keySectionsRecommended: ['Summary', 'E-commerce & Retail Strengths', 'Experience', 'Platform Certifications', 'Education'],
      commonPitfalls: ['Failing to mention GMV, order volume, or catalog SKU size']
    },
    exampleJobDescriptions: [
      {
        title: 'E-commerce Operations Manager',
        company: 'Verve Direct Brands',
        requiredExperienceYears: 3,
        requiredQualifications: ['3+ years managing Shopify Plus or Amazon Seller Central stores', 'Demonstrated track record optimizing listings, A+ content, and conversion rates', 'Proficiency with inventory management tools and ShipStation'],
        preferredQualifications: ['Experience managing digital advertising via Amazon Ads', 'Strong understanding of e-commerce SEO']
      }
    ]
  },
  {
    id: 'healthcare-medical',
    displayName: 'Healthcare and Medical Administration',
    description: 'Clinical nursing, medical administration, healthcare records, HIPAA compliance, patient care coordination, medical billing and coding.',
    category: 'Healthcare & Science',
    seniorityLevels: ['Certified Nursing Assistant (CNA)', 'Registered Nurse (RN)', 'Medical Biller / Coder', 'Charge Nurse', 'Clinical Nurse Manager', 'Director of Nursing / Medical Director'],
    jobTitles: [
      { title: 'Registered Nurse (RN)', level: 'Mid-Level', alternativeTitles: ['Staff Nurse', 'Clinical Nurse', 'ICU Nurse', 'Emergency Room Nurse'] },
      { title: 'Medical Office Administrator', level: 'Mid-Level', alternativeTitles: ['Clinical Practice Manager', 'Healthcare Administrator', 'Clinic Coordinator'] },
      { title: 'Medical Biller and Coder', level: 'Mid-Level', alternativeTitles: ['Health Information Technician', 'Medical Records Specialist', 'CPC Coder'] },
      { title: 'Clinical Nurse Supervisor', level: 'Lead / Staff', alternativeTitles: ['Charge Nurse', 'Nursing Supervisor', 'Nurse Manager'] }
    ],
    skills: {
      technicalSkills: [
        { name: 'Direct Patient Care & Assessment', category: 'Clinical Skills', synonyms: ['Triage', 'Vital Signs', 'IV Administration', 'Medication Administration', 'Wound Care'], importance: 'High' },
        { name: 'Electronic Health Records (EHR/EMR)', category: 'Healthcare Tech', synonyms: ['Epic Systems', 'Cerner', 'Athenahealth', 'eClinicalWorks'], importance: 'High' },
        { name: 'HIPAA & Healthcare Compliance', category: 'Compliance', synonyms: ['HIPAA Privacy Rule', 'Joint Commission (JCAHO)', 'OSHA Standards'], importance: 'High' },
        { name: 'Medical Terminology & Diagnostics', category: 'Clinical Knowledge', synonyms: ['Anatomy', 'Physiology', 'Pathology', 'Pharmacology'], importance: 'High' },
        { name: 'Medical Coding & Billing', category: 'Healthcare Administration', synonyms: ['ICD-10-CM', 'CPT Codes', 'HCPCS', 'Insurance Claims Processing'], importance: 'High' }
      ],
      toolsAndPlatforms: [
        { name: 'Epic EHR', synonyms: ['Epic Systems'] },
        { name: 'Cerner', synonyms: ['Oracle Cerner'] },
        { name: 'Athenahealth', synonyms: ['AthenaClinicals'] }
      ],
      domainTerminology: [
        'Infection control protocols', 'Patient Acuity Levels', 'BLS / ACLS protocols',
        'Electronic MAR (Medication Administration Record)', 'Discharge planning & continuum of care'
      ],
      softSkills: ['Compassionate Bedside Manner', 'High Clinical Composure Under Crisis', 'Patient Advocacy', 'Interdisciplinary Teamwork']
    },
    commonCertifications: ['RN (Registered Nurse License - State/eNLC)', 'BLS (Basic Life Support - AHA)', 'ACLS (Advanced Cardiac Life Support)', 'Certified Professional Coder (CPC - AAPC)', 'Certified Medical Administrative Assistant (CMAA)'],
    commonQualifications: ["Associate Degree in Nursing (ADN) or Bachelor of Science in Nursing (BSN), Active unencumbered State Nursing License"],
    achievementPatterns: {
      actionVerbs: ['Administered', 'Assessed', 'Coordinated', 'Monitored', 'Documented', 'Triage', 'Facilitated', 'Implemented'],
      metricTemplates: [
        'Delivered compassionate bedside patient care to [X]+ acute patients per shift across [Y]-bed unit with 100% adherence to clinical protocols.',
        'Maintained a [X]% medication administration safety record, accurately recording all orders within Epic Systems EHR.',
        'Streamlined clinical intake and registration processes, decreasing patient clinic wait times by [X]%.',
        'Audited and processed [X]+ medical insurance claims weekly in ICD-10/CPT, maintaining a [Y]% first-pass clean claim rate.'
      ]
    },
    resumeWritingGuidance: {
      summaryStrategy: 'Lead with active unencumbered nursing licenses (RN, State, Compact), patient caseload capacity, and EHR platform expertise (Epic, Cerner).',
      keySectionsRecommended: ['Summary', 'Licenses & Certifications (RN, BLS, ACLS)', 'Clinical Competencies', 'Professional Clinical Experience', 'Education'],
      commonPitfalls: ['Failing to state license state, license number/status, or omitting BLS/ACLS expiry details']
    },
    exampleJobDescriptions: [
      {
        title: 'Staff Registered Nurse (RN) - Medical/Surgical',
        company: 'St. Jude Healthcare Network',
        requiredExperienceYears: 2,
        requiredQualifications: ['Current unencumbered RN license in state of practice', 'Current AHA BLS and ACLS certifications', '2+ years acute care experience in Med/Surg or telemetry units', 'Proficiency with Epic EHR documentation'],
        preferredQualifications: ['Bachelor of Science in Nursing (BSN)', 'Certified Medical-Surgical Registered Nurse (CMSRN)']
      }
    ]
  },
  {
    id: 'engineering',
    displayName: 'Engineering',
    description: 'Mechanical, electrical, civil, chemical, and hardware engineering, CAD/CAM modeling, structural analysis, and technical design.',
    category: 'Engineering & Industrial',
    seniorityLevels: ['Junior Engineer', 'Mechanical/Electrical Engineer', 'Senior Project Engineer', 'Lead Systems Engineer', 'Principal Engineer', 'Chief Engineer'],
    jobTitles: [
      { title: 'Mechanical Engineer', level: 'Mid-Level', alternativeTitles: ['Design Engineer', 'Product Development Engineer', 'CAD Engineer'] },
      { title: 'Electrical Engineer', level: 'Mid-Level', alternativeTitles: ['Electronics Engineer', 'Hardware Engineer', 'Power Systems Engineer'] },
      { title: 'Civil Engineer', level: 'Mid-Level', alternativeTitles: ['Structural Engineer', 'Site Engineer', 'Transportation Engineer'] },
      { title: 'Senior Systems Engineer', level: 'Senior', alternativeTitles: ['Lead Design Engineer', 'Principal Systems Engineer', 'Engineering Lead'] }
    ],
    skills: {
      technicalSkills: [
        { name: 'Computer-Aided Design (CAD)', category: 'Design Software', synonyms: ['SolidWorks', 'AutoCAD', 'Autodesk Inventor', 'CATIA', 'PTC Creo'], importance: 'High' },
        { name: 'Finite Element Analysis (FEA)', category: 'Simulation', synonyms: ['ANSYS', 'FEA Simulation', 'Stress Analysis', 'Thermal Analysis'], importance: 'High' },
        { name: 'Circuit Design & PCB Layout', category: 'Electrical', synonyms: ['Altium Designer', 'KiCAD', 'Schematic Capture', 'Microcontrollers'], importance: 'High' },
        { name: 'Geometric Dimensioning & Tolerancing (GD&T)', category: 'Engineering Standards', synonyms: ['ASME Y14.5', 'GD&T', 'Tolerance Stack-Up Analysis'], importance: 'High' },
        { name: 'Prototyping & Manufacturing Design', category: 'Manufacturing', synonyms: ['DFM (Design for Manufacturability)', 'DFA (Design for Assembly)', '3D Printing', 'CNC Machining'], importance: 'High' }
      ],
      toolsAndPlatforms: [
        { name: 'SolidWorks', synonyms: ['SolidWorks 3D CAD'] },
        { name: 'AutoCAD', synonyms: ['Autodesk AutoCAD'] },
        { name: 'ANSYS', synonyms: ['ANSYS Mechanical'] },
        { name: 'MATLAB / Simulink', synonyms: ['MATLAB Modeling'] }
      ],
      domainTerminology: [
        'Root-mean-square (RMS)', 'BOM (Bill of Materials) management', 'Thermal dissipation & thermal relief',
        'Tensile yield strength & fatigue limits', 'Engineering Change Orders (ECO)'
      ],
      softSkills: ['Mathematical Rigor', 'Cross-Disciplinary Coordination', 'Vendor & Fabrication Communication', 'Field Problem Solving']
    },
    commonCertifications: ['PE (Professional Engineer License)', 'FE / EIT (Fundamentals of Engineering / Engineer in Training)', 'SolidWorks Certified Professional (CSWP)', 'Six Sigma Green Belt'],
    commonQualifications: ["Bachelor's or Master's in Mechanical, Electrical, Civil, Aerospace, or Chemical Engineering"],
    achievementPatterns: {
      actionVerbs: ['Designed', 'Engineered', 'Modeled', 'Simulated', 'Prototyped', 'Fabricated', 'Validated', 'Calculated'],
      metricTemplates: [
        'Designed high-precision mechanical enclosure in SolidWorks, cutting fabrication unit costs by [X]% through DFM optimization.',
        'Conducted FEA structural stress simulations in ANSYS, identifying critical failure points and enhancing component fatigue life by [X]%.',
        'Engineered multi-layer PCB layout in Altium Designer, reducing electrical electromagnetic interference (EMI) by [X] dB.',
        'Prepared and managed comprehensive Bills of Materials (BOM) and fabrication drawings with strict ASME Y14.5 GD&T compliance.'
      ]
    },
    resumeWritingGuidance: {
      summaryStrategy: 'Specify engineering discipline, PE/EIT status, CAD/simulation software mastery, and tangible product/structural milestones delivered.',
      keySectionsRecommended: ['Summary', 'Engineering Licensure (PE/EIT)', 'CAD & Simulation Tools', 'Engineering Project Experience', 'Education'],
      commonPitfalls: ['Omitting specific CAD packages (SolidWorks, AutoCAD) or failing to cite GD&T/ASME compliance']
    },
    exampleJobDescriptions: [
      {
        title: 'Senior Mechanical Design Engineer',
        company: 'Vanguard Aerospace & Robotics',
        requiredExperienceYears: 5,
        requiredQualifications: ['5+ years designing electro-mechanical hardware assemblies in SolidWorks', 'Expertise with FEA thermal/structural simulation and tolerance analysis', 'Hands-on experience taking hardware designs from prototype to DFM volume production'],
        preferredQualifications: ['Master of Science in Mechanical Engineering (MSME)', 'Active Professional Engineer (PE) license']
      }
    ]
  },
  {
    id: 'manufacturing-quality',
    displayName: 'Manufacturing and Quality',
    description: 'Plant operations, quality assurance, ISO 9001 audits, root cause analysis, statistical process control (SPC), assembly operations, and safety.',
    category: 'Engineering & Industrial',
    seniorityLevels: ['Quality Inspector', 'Quality Engineer', 'Manufacturing Engineer', 'Quality Assurance Manager', 'Plant Operations Director'],
    jobTitles: [
      { title: 'Quality Assurance Engineer', level: 'Mid-Level', alternativeTitles: ['QA Engineer (Manufacturing)', 'Quality Control Engineer', 'Quality Systems Specialist'] },
      { title: 'Manufacturing Engineer', level: 'Mid-Level', alternativeTitles: ['Process Engineer', 'Industrial Engineer', 'Assembly Process Specialist'] },
      { title: 'Quality Assurance Manager', level: 'Lead / Staff', alternativeTitles: ['Director of Quality Control', 'Director of Quality Systems'] }
    ],
    skills: {
      technicalSkills: [
        { name: 'Quality Management Systems (QMS)', category: 'Quality Systems', synonyms: ['ISO 9001', 'IATF 16949', 'AS9100', 'ISO 13485'], importance: 'High' },
        { name: 'Statistical Process Control (SPC)', category: 'Process Control', synonyms: ['Minitab', 'Control Charts', 'Cp/Cpk Capability Studies', 'Gauge R&R'], importance: 'High' },
        { name: 'Root Cause & Corrective Action', category: 'Problem Solving', synonyms: ['CAPA', '8D Problem Solving', '5 Whys', 'Fishbone / Ishikawa Diagrams'], importance: 'High' },
        { name: 'Failure Mode and Effects Analysis (FMEA)', category: 'Risk Analysis', synonyms: ['DFMEA', 'PFMEA', 'Risk Priority Number (RPN)'], importance: 'High' },
        { name: 'Lean Manufacturing & Continuous Improvement', category: 'Lean Methods', synonyms: ['Kaizen', 'Poka-Yoke (Mistake Proofing)', 'Value Stream Mapping (VSM)'], importance: 'High' }
      ],
      toolsAndPlatforms: [
        { name: 'Minitab', synonyms: ['Minitab Statistical Software'] },
        { name: 'Coordinate Measuring Machines (CMM)', synonyms: ['CMM Metrology', 'Calipers', 'Micrometers'] },
        { name: 'ERP Manufacturing Modules', synonyms: ['SAP PP', 'Epicor Manufacturing'] }
      ],
      domainTerminology: [
        'Parts Per Million (PPM) defect rate', 'First Pass Yield (FPY)', 'Non-Conformance Reports (NCR)',
        'Production Part Approval Process (PPAP)', 'Standard Operating Procedures (SOP)'
      ],
      softSkills: ['Uncompromising Standard of Accuracy', 'Cross-Shift Leadership', 'Audit Composure', 'Root Cause Tenacity']
    },
    commonCertifications: ['ASQ CQE (Certified Quality Engineer)', 'ASQ CQA (Certified Quality Auditor)', 'Six Sigma Green Belt / Black Belt', 'Certified Six Sigma Black Belt (CSSBB)'],
    commonQualifications: ["Bachelor's in Industrial Engineering, Mechanical Engineering, Materials Science, or certified ASQ credential"],
    achievementPatterns: {
      actionVerbs: ['Inspected', 'Reduced', 'Standardized', 'Audited', 'Investigated', 'Implemented', 'Calibrated', 'Validated'],
      metricTemplates: [
        'Reduced scrap rate by [X]% and saved $[Y]k annually by conducting 8D root-cause investigations and implementing Poka-Yoke tooling.',
        'Achieved [X]% First Pass Yield (FPY) across high-volume automated production line with a Cpk of >[Y].',
        'Led internal audit preparation for ISO 9001:2015 recertification, resulting in zero major non-conformances.',
        'Executed PFMEA risk assessments and Gauge R&R studies across [X] precision manufacturing fixtures.'
      ]
    },
    resumeWritingGuidance: {
      summaryStrategy: 'Display ASQ and Six Sigma certifications, defect reduction percentages (PPM), and QMS standards (ISO 9001/AS9100).',
      keySectionsRecommended: ['Summary', 'Quality Certifications (ASQ, Six Sigma)', 'QMS & Manufacturing Strengths', 'Experience', 'Education'],
      commonPitfalls: ['Omitting statistical metrics (Cp, Cpk, PPM, First Pass Yield) or naming of ISO standards']
    },
    exampleJobDescriptions: [
      {
        title: 'Senior Quality Assurance Engineer',
        company: 'Precision Components Corp',
        requiredExperienceYears: 4,
        requiredQualifications: ['4+ years in quality engineering within an ISO 9001 or AS9100 manufacturing facility', 'Mastery of Statistical Process Control (SPC), Gauge R&R, and Minitab', 'Proven expertise leading 8D CAPA root cause problem solving'],
        preferredQualifications: ['ASQ Certified Quality Engineer (CQE) or Six Sigma Green Belt', 'Experience conducting PPAP documentation for Tier 1 suppliers']
      }
    ]
  },
  {
    id: 'construction-infrastructure',
    displayName: 'Construction and Infrastructure',
    description: 'General contracting, civil construction, jobsite management, project bidding, building codes, OSHA compliance, and infrastructure development.',
    category: 'Engineering & Industrial',
    seniorityLevels: ['Field Engineer', 'Construction Estimator', 'Assistant Project Manager', 'Site Superintendent', 'Construction Project Manager', 'VP of Construction'],
    jobTitles: [
      { title: 'Construction Project Manager', level: 'Senior', alternativeTitles: ['Commercial Project Manager', 'General Contractor PM', 'Infrastructure Project Manager'] },
      { title: 'Site Superintendent', level: 'Senior', alternativeTitles: ['General Superintendent', 'Construction Superintendent', 'Jobsite Supervisor'] },
      { title: 'Construction Estimator', level: 'Mid-Level', alternativeTitles: ['Cost Estimator', 'Bidding Specialist', 'Preconstruction Estimator'] }
    ],
    skills: {
      technicalSkills: [
        { name: 'Construction Management Software', category: 'Software', synonyms: ['Procore', 'Plangrid', 'Bluebeam Revu', 'AutoCAD'], importance: 'High' },
        { name: 'Project Scheduling & Critical Path', category: 'Project Controls', synonyms: ['Primavera P6', 'Microsoft Project', 'CPM Scheduling', 'Submittals & RFIs'], importance: 'High' },
        { name: 'Cost Estimation & Bidding', category: 'Financial Controls', synonyms: ['Quantity Takeoff', 'Subcontractor Scopes', 'Bid Packages', 'Budget Forecasting'], importance: 'High' },
        { name: 'OSHA & Jobsite Safety Compliance', category: 'Safety & Compliance', synonyms: ['OSHA 30', 'Site Safety Audits', 'Toolbox Talks', 'PPE Enforcement'], importance: 'High' },
        { name: 'Building Codes & Inspection', category: 'Codes & Permitting', synonyms: ['IBC (International Building Code)', 'ADA Standards', 'City Permitting', 'Quality Control'], importance: 'High' }
      ],
      toolsAndPlatforms: [
        { name: 'Procore', synonyms: ['Procore Project Management'] },
        { name: 'Primavera P6', synonyms: ['Oracle Primavera P6'] },
        { name: 'Bluebeam Revu', synonyms: ['Bluebeam PDF Takeoff'] }
      ],
      domainTerminology: [
        'Requests for Information (RFIs)', 'Submittals & Shop Drawings', 'Change Orders & Contingency',
        'Notice to Proceed (NTP)', 'Substantial Completion & Punch Lists'
      ],
      softSkills: ['Subcontractor Negotiations', 'Jobsite Decisiveness', 'Owner/Architect Relations', 'Crisis Safety Leadership']
    },
    commonCertifications: ['OSHA 30-Hour Construction Safety', 'CCM (Certified Construction Manager)', 'PMP (Project Management Professional)', 'LEED AP (Leadership in Energy and Environmental Design)'],
    commonQualifications: ["Bachelor's in Construction Management, Civil Engineering, Building Science, or equivalent field general contracting history"],
    achievementPatterns: {
      actionVerbs: ['Constructed', 'Managed', 'Supervised', 'Estimated', 'Coordinated', 'Scheduled', 'Negotiated', 'Delivered'],
      metricTemplates: [
        'Delivered $[X]M commercial development project on schedule and [Y]% under budget with zero OSHA recordable safety incidents.',
        'Managed daily operations across [X]+ trades and subcontractors on active jobsite, maintaining critical path milestones via Primavera P6.',
        'Compiled accurate bid takeoffs in Bluebeam, winning $[X]M in competitive municipal infrastructure contracts.',
        'Resolved over [X] RFIs and submittal packages with architects, mitigating potential project delays.'
      ]
    },
    resumeWritingGuidance: {
      summaryStrategy: 'State total dollar value of construction projects delivered, safety record (OSHA 30, zero recordables), and management software (Procore, P6).',
      keySectionsRecommended: ['Summary', 'Safety & Professional Certifications (OSHA 30)', 'Construction Competencies', 'Project Experience (with Project $ Values)', 'Education'],
      commonPitfalls: ['Failing to quantify project values ($M), square footage, or safety records']
    },
    exampleJobDescriptions: [
      {
        title: 'Commercial Construction Project Manager',
        company: 'Keystone Builders & Contractors',
        requiredExperienceYears: 5,
        requiredQualifications: ['5+ years leading ground-up commercial construction projects valued at >$10M', 'Proficiency in Procore, Bluebeam Revu, and Primavera P6 scheduling', 'Valid OSHA 30-Hour Construction certification'],
        preferredQualifications: ['Degree in Construction Management or Civil Engineering', 'CCM or LEED AP accreditation']
      }
    ]
  },
  {
    id: 'education-training',
    displayName: 'Education and Training',
    description: 'Curriculum design, classroom instruction, corporate training, educational technology (EdTech), instructional design, and academic leadership.',
    category: 'Education & Public Service',
    seniorityLevels: ['Teaching Assistant', 'Teacher / Instructor', 'Senior Lecturer / Professor', 'Instructional Designer', 'Corporate Trainer', 'Dean / Academic Director'],
    jobTitles: [
      { title: 'Instructional Designer', level: 'Mid-Level', alternativeTitles: ['Curriculum Developer', 'Learning Experience Designer (LXD)', 'E-Learning Specialist'] },
      { title: 'Corporate Trainer', level: 'Mid-Level', alternativeTitles: ['Learning & Development (L&D) Specialist', 'Training Coordinator', 'Talent Development Specialist'] },
      { title: 'Educator / Teacher', level: 'Mid-Level', alternativeTitles: ['High School Teacher', 'Middle School Teacher', 'Classroom Instructor'] },
      { title: 'Director of Learning and Development', level: 'Lead / Staff', alternativeTitles: ['Head of L&D', 'Chief Learning Officer', 'Academic Director'] }
    ],
    skills: {
      technicalSkills: [
        { name: 'Instructional Design Methodologies', category: 'Pedagogy', synonyms: ['ADDIE Model', 'Bloom’s Taxonomy', 'Kirkpatrick Model', 'Agile SAM'], importance: 'High' },
        { name: 'Learning Management Systems (LMS)', category: 'EdTech', synonyms: ['Canvas', 'Blackboard', 'Moodle', 'Cornerstone OnDemand', 'Docebo'], importance: 'High' },
        { name: 'E-Learning Authoring Tools', category: 'Authoring Software', synonyms: ['Articulate Storyline 360', 'Articulate Rise', 'Adobe Captivate', 'Camtasia'], importance: 'High' },
        { name: 'Curriculum & Assessment Design', category: 'Curriculum', synonyms: ['Formative Assessment', 'Summative Assessment', 'Rubric Creation', 'Learning Objectives'], importance: 'High' },
        { name: 'Classroom Management & Delivery', category: 'Teaching', synonyms: ['Differentiated Instruction', 'Student Engagement', 'Virtual Classroom Facilitation', 'Webinars'], importance: 'High' }
      ],
      toolsAndPlatforms: [
        { name: 'Articulate 360', synonyms: ['Storyline 360', 'Rise 360'] },
        { name: 'Canvas LMS', synonyms: ['Instructure Canvas'] },
        { name: 'Adobe Captivate', synonyms: ['Captivate E-Learning'] }
      ],
      domainTerminology: [
        'Synchronous vs Asynchronous learning', 'Adult Learning Principles (Andragogy)',
        'SCORM / xAPI compliance', 'Knowledge retention metrics', 'Needs Analysis & Gap Assessment'
      ],
      softSkills: ['Enthusiastic Facilitation', 'Active Empathetic Mentorship', 'Clarity of Explanation', 'Patient Feedback Delivery']
    },
    commonCertifications: ['State Teaching License / Certification', 'Certified Professional in Learning and Performance (CPLP / CPTD)', 'Instructional Design Certificate (ATD)', 'Google Certified Educator'],
    commonQualifications: ["Bachelor's, Master's, or Ph.D. in Education, Instructional Design, Educational Technology, or subject matter discipline"],
    achievementPatterns: {
      actionVerbs: ['Instructed', 'Designed', 'Facilitated', 'Authored', 'Evaluated', 'Trained', 'Spearheaded', 'Mentored'],
      metricTemplates: [
        'Designed and deployed interactive e-learning curriculum in Articulate 360 for [X] corporate staff, increasing completion rates by [Y]%.',
        'Facilitated professional training workshops for over [X] adult learners, maintaining a [Y]% course satisfaction rating.',
        'Integrated Canvas LMS across [X] academic departments, training [Y] faculty members on digital rubric grading.',
        'Improved standardized student benchmark testing proficiency by [X]% through differentiated instruction and targeted tutoring.'
      ]
    },
    resumeWritingGuidance: {
      summaryStrategy: 'State instructional methodologies (ADDIE, Bloom), e-learning authoring tools (Articulate 360, Canvas), and learner outcome metrics.',
      keySectionsRecommended: ['Summary', 'Teaching / L&D Certifications', 'Instructional Design Strengths', 'Experience', 'Education & Publications'],
      commonPitfalls: ['Writing generic classroom duties without student/learner outcomes, satisfaction metrics, or authoring tools']
    },
    exampleJobDescriptions: [
      {
        title: 'Instructional Designer / E-Learning Specialist',
        company: 'Apex Learning Technologies',
        requiredExperienceYears: 3,
        requiredQualifications: ['3+ years developing asynchronous digital learning modules with Articulate 360 (Storyline and Rise)', 'Demonstrated knowledge of adult learning theory and ADDIE framework', 'Experience deploying SCORM packages into Canvas or Cornerstone LMS'],
        preferredQualifications: ['Master’s in Instructional Design or Educational Technology', 'Video editing skills using Camtasia or Premiere']
      }
    ]
  },
  {
    id: 'hospitality-travel',
    displayName: 'Hospitality and Travel',
    description: 'Hotel management, guest relations, front office operations, event planning, food & beverage coordination, and travel tourism.',
    category: 'Service & Support',
    seniorityLevels: ['Front Desk Agent', 'Concierge / Guest Relations', 'Event Coordinator', 'Restaurant / F&B Manager', 'Hotel General Manager'],
    jobTitles: [
      { title: 'Hotel General Manager', level: 'Senior', alternativeTitles: ['Hotel Operations Manager', 'Resort Manager', 'Managing Director'] },
      { title: 'Guest Services Manager', level: 'Mid-Level', alternativeTitles: ['Front Office Manager', 'Guest Relations Lead', 'Hotel Assistant Manager'] },
      { title: 'Event & Banquet Coordinator', level: 'Mid-Level', alternativeTitles: ['Hospitality Event Planner', 'Catering Sales Manager'] }
    ],
    skills: {
      technicalSkills: [
        { name: 'Property Management Systems (PMS)', category: 'Hospitality Tech', synonyms: ['Opera PMS', 'Amadeus Hospitality', 'Cloudbeds', 'Fidelio'], importance: 'High' },
        { name: 'Guest Relations & VIP Experience', category: 'Customer Experience', synonyms: ['Concierge Service', 'Complaint Resolution', 'VIP Protocol', 'Guest Loyalty Programs'], importance: 'High' },
        { name: 'Revenue Management & Booking', category: 'Financial Management', synonyms: ['RevPAR', 'ADR (Average Daily Rate)', 'Occupancy Rates', 'Yield Management'], importance: 'High' },
        { name: 'Food & Beverage Operations', category: 'F&B Operations', synonyms: ['Menu Planning', 'Banquet Service', 'Inventory Control', 'ServSafe Food Safety'], importance: 'High' },
        { name: 'Event Coordination & Scheduling', category: 'Events', synonyms: ['Banquet Event Orders (BEOs)', 'Vendor Coordination', 'Wedding & Corporate Events'], importance: 'High' }
      ],
      toolsAndPlatforms: [
        { name: 'Opera PMS', synonyms: ['Oracle Hospitality Opera'] },
        { name: 'OpenTable / Resy', synonyms: ['Restaurant Reservation Platforms'] },
        { name: 'Delphi / Amadeus', synonyms: ['Sales and Event Management'] }
      ],
      domainTerminology: [
        'RevPAR (Revenue Per Available Room)', 'ADR (Average Daily Rate)', 'Occupancy Percentage',
        'Forbes Travel Guide Five-Star Standards', 'TripAdvisor / OTA review scores'
      ],
      softSkills: ['Impeccable Hospitality Etiquette', 'Crisis Guest Resolution', 'Charismatic Leadership', 'Stamina Under High Volume']
    },
    commonCertifications: ['Certified Hotel Administrator (CHA)', 'Certified Hospitality Supervisor (CHS)', 'ServSafe Manager Food Protection', 'Sommelier Certification (Court of Master Sommeliers)'],
    commonQualifications: ["Bachelor's in Hospitality Management, Hotel Administration, Culinary Arts, or proven guest operations track record"],
    achievementPatterns: {
      actionVerbs: ['Managed', 'Coordinated', 'Elevated', 'Welcomed', 'Hosted', 'Supervised', 'Boosted', 'Organized'],
      metricTemplates: [
        'Managed daily operations of [X]-room luxury boutique hotel, driving annual occupancy to [Y]% and elevating RevPAR by [Z]%.',
        'Elevated guest satisfaction ratings on TripAdvisor from [X] to [Y] stars, achieving #1 regional ranking.',
        'Planned and orchestrated over [X] high-end corporate banquets and weddings generating $[Y]k in catering revenue.',
        'Trained and supervised front office staff of [X] associates with 100% compliance to Five-Star hospitality standards.'
      ]
    },
    resumeWritingGuidance: {
      summaryStrategy: 'State hotel room count, occupancy rate accomplishments, RevPAR growth, and PMS software (Opera, Delphi).',
      keySectionsRecommended: ['Summary', 'Hospitality Certifications (ServSafe, CHA)', 'Guest Services Competencies', 'Experience', 'Education'],
      commonPitfalls: ['Writing generic service responsibilities without room counts, occupancy numbers, or customer rating scores']
    },
    exampleJobDescriptions: [
      {
        title: 'Front Office Operations Manager',
        company: 'Grand Horizon Luxury Resorts',
        requiredExperienceYears: 4,
        requiredQualifications: ['4+ years in upscale hotel front office or guest services management', 'Proficiency in Oracle Opera PMS or Cloudbeds', 'Demonstrated record elevating guest satisfaction scores and ADR'],
        preferredQualifications: ['Degree in Hospitality Management', 'Certified Hospitality Supervisor (CHS) designation']
      }
    ]
  },
  {
    id: 'project-management-executive',
    displayName: 'Project Management and Executive Leadership',
    description: 'Agile/Scrum management, program governance, enterprise strategic planning, stakeholder alignment, P&L management, and executive leadership.',
    category: 'Operations & Management',
    seniorityLevels: ['Associate Project Manager', 'Scrum Master', 'Project Manager (PMP)', 'Senior Program Manager', 'Director of PMO', 'Chief Operating Officer (COO) / CEO'],
    jobTitles: [
      { title: 'Project Manager (PMP)', level: 'Mid-Level', alternativeTitles: ['Technical Project Manager', 'Delivery Lead', 'Project Lead'] },
      { title: 'Program Manager', level: 'Senior', alternativeTitles: ['Senior Program Manager', 'Enterprise PMO Lead', 'Portfolio Manager'] },
      { title: 'Scrum Master / Agile Coach', level: 'Mid-Level', alternativeTitles: ['Agile Project Manager', 'RTE (Release Train Engineer)', 'Agile Delivery Lead'] },
      { title: 'Director of Program Management (PMO)', level: 'Lead / Staff', alternativeTitles: ['Head of PMO', 'VP of Strategic Execution', 'Chief Operating Officer (COO)'] }
    ],
    skills: {
      technicalSkills: [
        { name: 'Project Lifecycle Management', category: 'Methodology', synonyms: ['Waterfall', 'Agile', 'Scrum', 'Kanban', 'Hybrid Methodologies', 'PRINCE2'], importance: 'High' },
        { name: 'Project Management Software', category: 'Tools', synonyms: ['Jira Software', 'Asana', 'Monday.com', 'Smartsheet', 'Microsoft Project'], importance: 'High' },
        { name: 'Budgeting & P&L Governance', category: 'Financial Controls', synonyms: ['Resource Allocation', 'Budget Tracking', 'Variance Analysis', 'Earned Value (EVM)'], importance: 'High' },
        { name: 'Risk Management & Mitigation', category: 'Governance', synonyms: ['RAID Logs', 'Risk Register', 'Contingency Planning', 'Critical Path Method'], importance: 'High' },
        { name: 'Executive Stakeholder Management', category: 'Leadership', synonyms: ['Steering Committee Reporting', 'Executive Alignment', 'Vendor Contracts', 'Change Management'], importance: 'High' }
      ],
      toolsAndPlatforms: [
        { name: 'Jira Software', synonyms: ['Atlassian Jira', 'Confluence'] },
        { name: 'Smartsheet', synonyms: ['Smartsheet PMO'] },
        { name: 'Asana', synonyms: ['Asana Enterprise'] }
      ],
      domainTerminology: [
        'Sprint velocity and burndown charts', 'Scope creep & change management requests',
        'Earned Value Management (EVM)', 'Key Performance Indicators (KPIs) & OKRs', 'Cross-functional dependencies'
      ],
      softSkills: ['Strategic Vision Alignment', 'Decisive Consensus Building', 'Influence Without Direct Authority', 'Conflict Mediation', 'Executive Presence']
    },
    commonCertifications: ['PMP (Project Management Professional - PMI)', 'CSM (Certified ScrumMaster - Scrum Alliance)', 'PMI-ACP (Agile Certified Practitioner)', 'SAFe Agilist (Scaled Agile Framework)', 'PRINCE2 Practitioner'],
    commonQualifications: ["Bachelor's or Master's in Business Administration (MBA), Computer Science, Engineering, or active PMP credential"],
    achievementPatterns: {
      actionVerbs: ['Spearheaded', 'Governed', 'Directed', 'Orchestrated', 'Delivered', 'Mitigated', 'Standardized', 'Accelerated'],
      metricTemplates: [
        'Spearheaded $[X]M enterprise digital transformation program across [Y] cross-functional squads, delivering all deliverables on schedule and [Z]% under budget.',
        'Established formal PMO governance frameworks, increasing on-time project delivery rates from [X]% to [Y]%.',
        'Led agile sprint delivery using Jira for [X] developers, boosting velocity by [Y]% and reducing defect spillover.',
        'Managed multi-million dollar vendor contracts, successfully mitigating [X] critical project risks through structured RAID logs.'
      ]
    },
    resumeWritingGuidance: {
      summaryStrategy: 'Lead with PMP/CSM credentials, total budget/portfolio size delivered ($M), methodology specialization (Agile/Waterfall), and stakeholder influence.',
      keySectionsRecommended: ['Executive Summary', 'Credentials (PMP, CSM, SAFe)', 'Program & Portfolio Management Core Competencies', 'Experience', 'Education & MBA'],
      commonPitfalls: ['Describing daily tasks rather than project outcomes, budget figures, team sizes, and on-time delivery percentages']
    },
    exampleJobDescriptions: [
      {
        title: 'Senior Technical Program Manager (PMP)',
        company: 'Vanguard Global Systems',
        requiredExperienceYears: 6,
        requiredQualifications: ['6+ years managing large-scale cross-functional software programs', 'Active Project Management Professional (PMP) or CSM certification', 'Mastery of Jira, Confluence, and Agile/Scrum delivery frameworks'],
        preferredQualifications: ['Master of Business Administration (MBA)', 'Experience managing multi-million dollar capital technology budgets']
      }
    ]
  }
];

// Write individual JSON files
const outputDir = path.join(__dirname, '..', 'knowledge', 'job-families');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

jobFamilies.forEach(family => {
  const filePath = path.join(outputDir, `${family.id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(family, null, 2), 'utf8');
  console.log(`Generated: ${family.id}.json (${family.displayName})`);
});

// Write master catalog file
const masterCatalogPath = path.join(outputDir, 'index.json');
fs.writeFileSync(masterCatalogPath, JSON.stringify({
  totalFamilies: jobFamilies.length,
  updatedAt: new Date().toISOString(),
  families: jobFamilies.map(f => ({
    id: f.id,
    displayName: f.displayName,
    category: f.category,
    description: f.description,
    seniorityLevels: f.seniorityLevels,
    topJobTitles: f.jobTitles.slice(0, 4).map(j => j.title),
    technicalSkillsCount: f.skills.technicalSkills.length,
    commonCertifications: f.commonCertifications
  }))
}, null, 2), 'utf8');

console.log(`\nSuccessfully generated ${jobFamilies.length} job families + master catalog index.json!`);
