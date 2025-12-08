const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

// --- Enhanced Mock Data Definitions & State ---

// Function to generate unique IDs for mock data
let candidateIdCounter = 100;
const generateCandidateId = () => `cnd_${candidateIdCounter++}`;
let brIdCounter = 4011;
const generateBrId = () => `${brIdCounter++}`;

// ENRICHED MOCK CANDIDATE DATA (with all requested fields)
let MOCK_CANDIDATE_DATA = [
    {
        id: generateCandidateId(),
        candidateName: 'Surya Venkata Bhavani Kalluri',
        grade: 'E2', // Updated Grade
        sbu: 'Verizon CAD IND',
        skill: '.Net', // Mapped from Skill Bucket
        subSkill: 'HTML, CSS, Javascript, SQL, SQL server, Webservice', // Mapped from Detailed Skills
        totalExp: '1.5 years',
        infiniteDOJ: '02-Jul-25',
        releaseDate: '05-Aug-25',
        status: 'Available'
    },
    {
        id: generateCandidateId(),
        candidateName: 'R Gokul',
        grade: 'E2', // Updated Grade
        sbu: 'ITS - Telecom',
        skill: 'Support Engineer', // Mapped from Skill Bucket
        subSkill: 'Kibana, Grafana, New Relic, Splunk, Looker Studio, Microsoft SQL, Linux, Shell Scripting', // Combined skills
        totalExp: '3 years',
        infiniteDOJ: '23-Apr-25',
        releaseDate: '06-Aug-25',
        status: 'Active'
    },
    {
        id: generateCandidateId(),
        candidateName: 'Pamidimukkala Bhargavi',
        grade: 'E3', // Updated Grade
        sbu: 'ITS - Telecom',
        skill: 'Support Engineer', // Mapped from Skill Bucket
        subSkill: 'Elastic search, Json, Grafana, sql, psql, Looker Studio, Dynatrace, Api&Microservices, manual testing, functionality testing, golang', // Combined skills
        totalExp: '3.7 years',
        infiniteDOJ: '25-Apr-25',
        releaseDate: '06-Aug-25',
        status: 'Active'
    },
    {
        id: generateCandidateId(),
        candidateName: 'Mohnish Ranjan',
        grade: 'E4', // Updated Grade
        sbu: 'Verizon CAD IND',
        skill: 'Data Engineer', // Mapped from Skill Bucket
        subSkill: 'Data Bricks, SQL Pyspark, Python, Data Analytics, Data science, Power BI, Linux, Shell Scripting, US health care', // Combined skills
        totalExp: '8+ years',
        infiniteDOJ: '11-Sep-24',
        releaseDate: '08-Aug-25',
        status: 'Active'
    },
    {
        id: generateCandidateId(),
        candidateName: 'M Raveendra Kumar',
        grade: 'E5', // Updated Grade
        sbu: 'ITS - Telecom',
        skill: 'Java Full stack developer', // Mapped from Skill Bucket
        subSkill: 'Java, Spring Boot, Hibernet, Struts, JPA, React, Node JS, micro services, AWS, PCF, Coupa', // Combined skills
        totalExp: '13+ years',
        infiniteDOJ: '18-Oct-24',
        releaseDate: '14-Aug-25',
        status: 'Active'
    },
    {
        id: generateCandidateId(),
        candidateName: 'Amit Rana',
        grade: 'E4', // Updated Grade
        sbu: 'ITS - Telecom',
        skill: 'Java Full stack developer', // Mapped from Skill Bucket
        subSkill: 'NodeJS, React native, Python, Java script, type script, React JS', // Combined skills
        totalExp: '12+ years',
        infiniteDOJ: '30-Aug-24',
        releaseDate: '06-Aug-25',
        status: 'Active'
    },
    {
        id: generateCandidateId(),
        candidateName: 'Ganala V Durga Prasad',
        grade: 'E5',
        sbu: 'ITS - Telecom',
        skill: 'Java Developer', // Mapped from Skill Bucket
        subSkill: 'Spring boot, Spring Hibernet, Oracle, SQL Server',
        totalExp: '12 years',
        infiniteDOJ: '12-Dec-24',
        releaseDate: '12-Aug-25',
        status: 'Active'
    },
    {
        id: generateCandidateId(),
        candidateName: 'Jahangeer Kumar Kuncham',
        grade: 'E4', // Updated Grade
        sbu: 'ITS - Telecom',
        skill: 'Java Developer', // Mapped from Skill Bucket
        subSkill: 'Java, Spring boot, micro services, Hibernet',
        totalExp: '9 years',
        infiniteDOJ: '04-Sep-24',
        releaseDate: '14-Aug-25',
        status: 'Active'
    }
];

// Enhanced MOCK JOB REQUIREMENTS (with status and openings)
let MOCK_JOB_REQUIREMENTS = [
    { brId: '4001', client: 'Cisco Tech', grade: 'E5', skills: 'Python, AWS, Lambda, Data Lake', noOfOpenings: 3, status: 'Open', fileName: 'req_001.xlsx' },
    { brId: '4002', client: 'Google Core', grade: 'E4', skills: 'JavaScript, React, Node.js, GraphQL', noOfOpenings: 1, status: 'Active', fileName: 'req_001.xlsx' },
    { brId: '4003', client: 'Amazon Digital', grade: 'E6', skills: 'Java, Spring Boot, Microservices, Kafka', noOfOpenings: 2, status: 'Closed', fileName: 'req_001.xlsx' },
    { brId: '4004', client: 'Netflix Media', grade: 'E5', skills: 'Rust, C++, Embedded Systems, Linux', noOfOpenings: 1, status: 'Open', fileName: 'req_002.xlsx' },
    { brId: '4005', client: 'Apple Services', grade: 'E4', skills: 'Swift, iOS SDK, UI/UX, REST API', noOfOpenings: 2, status: 'Active', fileName: 'req_002.xlsx' },
    { brId: '4006', client: 'Salesforce CRM', grade: 'E5', skills: 'Apex, LWC, Salesforce API, SQL', noOfOpenings: 1, status: 'Active', fileName: 'req_003.xlsx' },
    { brId: '4007', client: 'Microsoft Azure', grade: 'E3', skills: 'C#, .NET Core, Azure DevOps, SQL Server', noOfOpenings: 4, status: 'Open', fileName: 'req_003.xlsx' },
    { brId: '4008', client: 'Tesla Auto', grade: 'E6', skills: 'Python, ML, Computer Vision, TensorFlow', noOfOpenings: 1, status: 'Open', fileName: 'req_003.xlsx' },
    { brId: '4009', client: 'Cisco Tech', grade: 'E5', skills: 'Network Security, Cisco IOS, Python', noOfOpenings: 3, status: 'Active', fileName: 'req_004.xlsx' },
    { brId: '4010', client: 'Amazon Digital', grade: 'E4', skills: 'AWS, Kubernetes, GoLang, CI/CD', noOfOpenings: 2, status: 'Open', fileName: 'req_004.xlsx' },
];

const MOCK_BR_DETAILS = [
    {
        brId: '4001', designation: 'Senior Network Engineer', client: 'Cisco Tech',
        mandatorySkills: 'Python, AWS, Lambda', entity: 'OFFSHORE', clientBilling: 'Non-Billable',
        project: 'Network Assoc', rmName: 'Sunil Kalidindi', jobDesc: 'Network Security',
        joiningLoc: 'Gurgaon', backfillFor: '-', dateApps: '17-Apr-25', noOfOpenings: 3
    },
    {
        brId: '4002', designation: 'Associate Support Engineer', client: 'Google Core',
        mandatorySkills: 'ITIL Foundation', entity: 'IMS Converge', clientBilling: 'Billable',
        project: 'IMS - Converge', rmName: 'Thirupathi Thumpa', jobDesc: 'Support Engineer',
        joiningLoc: 'Bangalore - Global Axis', backfillFor: 'Ramya', dateApps: '14-Jun-25', noOfOpenings: 1
    },
    {
        brId: '4003', designation: 'Support Engineer', client: 'Amazon Digital',
        mandatorySkills: 'ITIL Foundation', entity: 'IMS Converge', clientBilling: 'Billable',
        project: 'IMS - Converge', rmName: 'Thirupathi Thumpa', jobDesc: 'Support Engineer',
        joiningLoc: 'Bangalore - Global Axis', backfillFor: 'Ramya', dateApps: '19-Aug-25', noOfOpenings: 2
    },
    {
        brId: '4004', designation: 'Technical Architect', client: 'Netflix Media',
        mandatorySkills: 'ServiceNow', entity: 'OFFSHORE', clientBilling: 'BrightSpeed',
        project: 'Enterprise and', rmName: 'Sharmila', jobDesc: 'Major Post',
        joiningLoc: 'Bangalore - Campus', backfillFor: 'Mani', dateApps: '23-May-25', noOfOpenings: 1
    },
    {
        brId: '4005', designation: 'Technical Lead', client: 'Apple Services',
        mandatorySkills: 'CSS, HTML, Java, React JS', entity: 'IRON MOUNT', clientBilling: 'IRON MOUNT',
        project: 'IMP / DKP-26', rmName: 'Huparry', jobDesc: 'Java Full Stack',
        joiningLoc: 'Bangalore - Campus', backfillFor: 'Sunil', dateApps: '17-Jul-25', noOfOpenings: 2
    },
    {
        brId: '4006', designation: 'Senior Solution Architect', client: 'Salesforce CRM',
        mandatorySkills: 'Machine Learning, Python', entity: 'OFFSHORE', clientBilling: 'VERIZON Corp',
        project: 'VR SR-41', rmName: 'Sharmuga', jobDesc: 'Job Summary',
        joiningLoc: 'Chennai', backfillFor: 'Guru', dateApps: '18-Jul-25', noOfOpenings: 1
    },
    {
        brId: '4007', designation: 'Senior Network Engineer', client: 'Microsoft Azure',
        mandatorySkills: 'Monitoring', entity: 'OFFSHORE', clientBilling: 'Liberty Iberia',
        project: 'LLA NOC Scope', rmName: 'Deatrapande', jobDesc: 'NOC Engineer',
        joiningLoc: 'Noida', backfillFor: 'Lavit Nagar', dateApps: '23-Jul-25', noOfOpenings: 4
    },
    {
        id: generateBrId(), designation: 'Senior Network Engineer', client: 'Tesla Auto',
        mandatorySkills: 'Monitoring', entity: 'OFFSHORE', clientBilling: 'Liberty Iberia',
        project: 'LLA NOC Scope', rmName: 'Deatrapande', jobDesc: 'NOC Engineer',
        joiningLoc: 'Noida', backfillFor: 'Arnab Nag', dateApps: '24-Jul-25', noOfOpenings: 1
    },
    {
        brId: '4009', designation: 'Technical Manager', client: 'Cisco Tech',
        mandatorySkills: 'SAP', entity: 'OFFSHORE', clientBilling: 'BrightSpeed',
        project: 'SAP FICO Group', rmName: 'Thiyagarajan', jobDesc: 'Hands On',
        joiningLoc: 'Bangalore', backfillFor: 'Rajesh', dateApps: '28-Jul-25', noOfOpenings: 3
    },
    {
        brId: '4010', designation: 'Senior Technical Lead', client: 'Amazon Digital',
        mandatorySkills: 'Monitoring', entity: 'OFFSHORE', clientBilling: 'Liberty Iberia',
        project: 'LLA NOC Scope', rmName: 'Deatrapande', jobDesc: 'Job Description',
        joiningLoc: 'Noida', backfillFor: 'Ashok Kumar', dateApps: '30-Jul-25', noOfOpenings: 2
    },
];

const MOCK_ANALYSIS_DATA = {
    "message": "✅ Resume Processed Successfully!",
    "resume_detected_skills": [
        "java",
        "aws"
    ],
    "candidates": [
        {
            "employee_name": "Deepak Choudhary",
            "individual_skill_match_percent": {
                "java": 100,
                "react": 18.05
            },
            "resume_experience_years": 3,
            "expected_experience": "E2 (3-5 yrs)",
            "experience_match_percent": 75,
            "resume_summary": "Deepak Choudhary Java Backend Developer Email: deepak.choudhary231199@gmail.com Mobile: +91- 9123120364 Pune (India) Java Backend Developer with 3+ years of experience in building secure, scalable, and high- performance backend systems using Core Java, Spring Boot, Spring Security, Hibernate, and RESTful Microservices. Proficient in MySQL, RabbitMQ, JUnit, Mockito, Git, and Maven with a strong focus on API development, asynchronous messaging, and performance tuning. Experienced in Agile workflows, debugging complex issues, and cross-functional collaboration. Proven ability to deliver clean, maintainable code and optimize...",
            "preview_text": "Deepak Choudhary\nJava Backend Developer\nEmail: deepak.choudhary231199@gmail.com Mobile: +91- 9123120364 Pune (India)\nJava Backend Developer with 3+ years of experience in building secure, scalable, and high-\nperformance backend systems using Core Java, Spring Boot, Spring Security, Hibernate, and\nRESTful Microservices. Proficient in MySQL, RabbitMQ, JUnit, Mockito, Git, and Maven with a\nstrong focus on API development, asynchronous messaging, and performance tuning.\nExperienced in Agile workflows, debugging complex issues, and cross-functional collaboration.\nProven ability to deliver clean, ma"
        },
        {}, // Second candidate
        {}  // Third candidate
    ]
};
// Mock in-memory state for analysis results (Keyed by brId) and final selections (Keyed by brId)
const ANALYSIS_RESULTS_STATE = {};
const FINAL_SELECTION_STATE = {};
// State to hold the final shortlist for a given BR ID (before analysis)
const SHORTLIST_STATE = {};

// Mock state for uploaded resumes (Candidate ID -> File Name)
const UPLOADED_RESUMES = {}; 

/**
 * Generates mock resume analysis results in the specified service response format.
 * Service format: { autoReqId, employees: [ { empNo, overallPercent, skills: [ { skillName, matchPercent, preferredFlag } ] } ] }
 */
const generateMockAnalysisResults = (brId, requiredSkillsArray, candidateIds) => {
    // Filter the candidates that were submitted
    const submittedCandidates = MOCK_CANDIDATE_DATA.filter(c => candidateIds.includes(c.id));

    const employees = submittedCandidates.map((candidate) => {
        // Simple mock scoring logic for overallPercent
        const experienceValue = parseFloat(candidate.totalExp.split('+')[0].trim());
        const skillMatchBase = requiredSkillsArray.some(skill => candidate.subSkill.toLowerCase().includes(skill.toLowerCase())) ? 60 : 40;
        // Overall percent based on skill match base + (1 point per year of experience) + random element
        const overallPercent = Math.min(95, Math.round(skillMatchBase + experienceValue + Math.floor(Math.random() * 15)));

        // Split candidate skills and required skills
        const candidateSkills = candidate.subSkill.toLowerCase().split(',').map(s => s.trim());
        const requiredSkillsLower = requiredSkillsArray.map(s => s.toLowerCase());

        const skillResults = requiredSkillsArray.map((reqSkill, index) => {
            const skillLower = reqSkill.toLowerCase();
            const isMatch = candidateSkills.some(candSkill => candSkill.includes(skillLower)); // Simple fuzzy match
            
            let matchPercent;
            let preferredFlag = (index < 2 || Math.random() < 0.5) ? 'Y' : 'N'; // Mock logic for Preferred Flag

            if (isMatch) {
                matchPercent = 70 + Math.floor(Math.random() * 25); // 70-95% for match
            } else {
                matchPercent = 20 + Math.floor(Math.random() * 30); // 20-50% for no explicit match
            }

            return {
                skillName: reqSkill,
                matchPercent: matchPercent,
                preferredFlag: preferredFlag
            };
        });

        return {
            empNo: candidate.id, // Using candidate ID as 'empNo' for mock purposes
            candidateName: candidate.candidateName,
            overallMatch: overallPercent, // Renamed for client consistency
            skills: skillResults,
            // Mock additional data for details view
            experience: candidate.totalExp,
            resumeSummary: `The resume shows strong experience in ${candidate.skill} with key projects utilizing ${requiredSkillsArray.slice(0,2).join(', ')}.`,
        };
    });

    // Sort by overallMatch descending (equivalent to ranking)
    employees.sort((a, b) => b.overallMatch - a.overallMatch);
    
    // Return in the exact service response format
    return {
        autoReqId: brId, // Using brId as autoReqId
        employees: employees
    };
};


// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- API Endpoints (12 TOTAL) ---


// 1. GET /candidates - Returns the full, enriched candidate list.
app.get('/candidates', (req, res) => {
    console.log('API: GET /candidates (1/12)');
    res.status(200).json({
        data: MOCK_CANDIDATE_DATA, 
        count: MOCK_CANDIDATE_DATA.length
    });
});

// 2,3 GET /job-requirements - Returns the full BR list.
app.get('/job-requirements', (req, res) => {
    console.log('API: GET /job-requirements (2/12)');
    res.status(200).json({
        data: MOCK_JOB_REQUIREMENTS,
        count: MOCK_JOB_REQUIREMENTS.length
    });
});


// 4. POST /job-requirements/upload - Simulates file upload and BR list update
app.post('/job-requirements/upload', (req, res) => {
    console.log('API: POST /job-requirements/upload (4/12)');
    // Mock logic remains the same (returns mock success)
    res.status(200).json({
        message: 'BR upload mock success.',
        data: MOCK_JOB_REQUIREMENTS,
        count: MOCK_JOB_REQUIREMENTS.length,
        newBrIds: []
    });
});


// 5. GET /job-requirements/details/:brId - Retrieves BR details
app.get('/job-requirements/details/:brId', (req, res) => {
    const { brId } = req.params;
    console.log(`API: GET /job-requirements/details/${brId} (5/12)`);
    const details = [{
    "grade": "E3",
    "designation": "Senior Network Engineer",
    "clientInterview": "Yes",
    "mandatorySkills": "Cisco Certified Network Associate (CCNA)",
    "entity": "OFFSHORE",
    "clientName": "Yahoo Holdings Inc",
    "billingType": "Billable",
    "project": "Yahoo Application Support",
    "requesterId": "1015402.0",
    "rmName": "Sinai Kakodkar, Bhasker (1015402)",
    "jobDescription": "Network SecurityInternet protocolsJunipe/Cisco",
    "joiningLocation": "Gurgaon",
    "backfillForEmployeeName": "",
    "dateApproved": "2025-04-17",
    "noOfPositions": 1,
    "positionsRemaining": 1,
    "sourcingType": "External - India",
    "requirementType": "New",
    "stBillRate": 32.00,
    "autoReqId": "31840BR",
    "currentReqStatus": "Open"
}]

    if (!details) {
        return res.status(404).json({ error: `Job requirement details not found for BR ID ${brId}.` });
    }

    res.status(200).json(details);
});


// 6. DELETE /job-requirements/:brId - Removes BR data
app.delete('/job-requirements/:brId', (req, res) => {
    const { brId } = req.params;
    console.log(`API: DELETE /job-requirements/${brId} (6/12)`);
    const initialLength = MOCK_JOB_REQUIREMENTS.length;
    
    MOCK_JOB_REQUIREMENTS = MOCK_JOB_REQUIREMENTS.filter(br => br.brId !== brId);

    if (MOCK_JOB_REQUIREMENTS.length < initialLength) {
        res.status(200).json({
            message: `Job requirement BR ID ${brId} deleted successfully.`,
            deletedBrId: brId,
            newCount: MOCK_JOB_REQUIREMENTS.length
        });
    } else {
        res.status(404).json({
            error: `Job requirement BR ID ${brId} not found.`
        });
    }
});


// 7. POST /shortlist/create - Shortlist candidate in action row
app.post('/shortlist/create', (req, res) => {
    const { brId, requiredSkills } = req.body;
    console.log(`API: POST /shortlist/create (7/12) for BR ${brId}`);

    if (!brId || !requiredSkills) {
        return res.status(400).json({ error: 'Missing or invalid brId or requiredSkills.' });
    }

    // Mock auto-shortlisting logic
    const matchingCandidates = MOCK_CANDIDATE_DATA.slice(0, 5); // Mock returning top 5 for review

    res.status(201).json({
        message: `Shortlist created for BR ID ${brId}. Review is ready.`,
        brId: brId,
        reviewShortlist: matchingCandidates // Returns the full candidate objects for review
    });
});


// 8. POST /candidates/upload - Upload candidate data & fetch updated data
app.post('/candidates/upload', (req, res) => {
    console.log('API: POST /candidates/upload (8/12)');
    
    const uploadFileName = req.body.fileName || 'candidates.xlsx';
    
    // Add one new mock candidate every time the upload is called
    const newCandidate = {
        id: generateCandidateId(),
        candidateName: `Uploaded Candidate ${candidateIdCounter - 100}`,
        grade: 'E3',
        sbu: 'New Client SBU',
        skill: 'Upload Test Skill',
        subSkill: 'React, Redux, AWS, Python',
        totalExp: '7 years',
        infiniteDOJ: '01-Jan-26',
        releaseDate: '01-Mar-26',
        status: 'Available'
    };

    MOCK_CANDIDATE_DATA.push(newCandidate);
    const newCount = MOCK_CANDIDATE_DATA.length;
    
    // Returns the updated list of ALL Candidate Profile objects (required data fetch)
    res.status(200).json({
        message: `Candidate file **${uploadFileName}** uploaded. Added 1 new candidate.`,
        data: MOCK_CANDIDATE_DATA, 
        count: newCount,
        newCandidateId: newCandidate.id
    });
});


// 9. POST /selection/submit-for-upload - Post selected candidates to send to next step (Step 1 -> Step 2)
app.post('/selection/submit-for-upload', (req, res) => {
    const { brId, candidateIds } = req.body;
    console.log(`API: POST /selection/submit-for-upload (9/12) for ${candidateIds.length} candidates`);

    if (!brId || !candidateIds || !Array.isArray(candidateIds)) {
        return res.status(400).json({ error: 'Missing brId or candidateIds.' });
    }
    
    // Mock: Store the committed selection
    SHORTLIST_STATE[brId] = candidateIds;
    
    res.status(200).json({
        message: `${candidateIds.length} candidate(s) successfully committed to the Upload Resumes stage for BR ID ${brId}.`,
        committedCount: candidateIds.length
    });
});


// 10. POST /resume/upload - Upload resume for a specific candidate (Step 2)
app.post('/resume/upload', (req, res) => {
    const { candidateId, fileName } = req.body;
    console.log(`API: POST /resume/upload (10/12) for ${candidateId}`);
    
    if (!candidateId || !fileName) {
        return res.status(400).json({ error: 'Missing candidateId or fileName.' });
    }
    
    // Mock: Store the uploaded file reference
    UPLOADED_RESUMES[candidateId] = fileName;
    
    res.status(200).json({
        message: `Resume **${fileName}** uploaded successfully for candidate ${candidateId}.`,
        candidateId: candidateId,
        uploadedFileName: fileName
    });
});

// 11. DELETE /resume/delete/:candidateId - Delete the resume (Step 2)
app.delete('/resume/delete/:candidateId', (req, res) => {
    const { candidateId } = req.params;
    console.log(`API: DELETE /resume/delete/${candidateId} (11/12)`);
    
    if (!UPLOADED_RESUMES[candidateId]) {
         return res.status(404).json({ error: `No resume found for candidate ${candidateId}.` });
    }

    const deletedFileName = UPLOADED_RESUMES[candidateId];
    delete UPLOADED_RESUMES[candidateId];
    
    res.status(200).json({
        message: `Resume **${deletedFileName}** deleted successfully for candidate ${candidateId}.`,
        candidateId: candidateId
    });
});


// 12. POST /analysis/trigger - Analyze resumes (Step 2 -> Step 3)
app.post('/analysis/trigger', (req, res) => {
    const { brId, candidatesForAnalysis, requiredSkills } = req.body;
    console.log(`API: POST /analysis/trigger (12/12) for BR ${brId}`);
    
    if (!brId || !candidatesForAnalysis || !requiredSkills) {
        return res.status(400).json({ error: 'Missing brId, candidate list, or requiredSkills.' });
    }

    // In a real scenario, you would process the request data here.
    // For this mock, we will return the static data structure.
    
    const analysisResults = MOCK_ANALYSIS_DATA;
    
    // NOTE: The original code stored results globally, which isn't necessary 
    // when just returning static data, but you can keep a placeholder if needed.
    // ANALYSIS_RESULTS_STATE[brId] = analysisResults;

    res.status(202).json({
        message: `Analysis job started for ${analysisResults.candidates.length} candidate(s) under BR ID ${brId}.`,
        resultCount: analysisResults.candidates.length,
        // The original endpoint returned an object structure with 'employees'
        // This is updated to return the 'analysisResults' object directly.
        resultsReady: analysisResults
    });
});


// --- Helper/Legacy Endpoints (Included for completeness/debugging) ---

// app.get('/analysis-results/:brId', (req, res) => {
//     const { brId } = req.params;
//     const results = ANALYSIS_RESULTS_STATE[brId];

//     if (!results) {
//         return res.status(404).json({ error: `No analysis results found for BR ID ${brId}.` });
//     }
//     res.status(200).json(results);
// });

// app.post('/selection/final', (req, res) => {
//     res.status(201).json({ message: `Final selection recorded for BR ID ${req.body.brId}.`, count: req.body.selectedCandidateIds.length });
// });

// app.get('/selection/final/:brId', (req, res) => {
//     res.status(200).json({ brId: req.params.brId, data: [], count: 0 });
// });


// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    console.log(`Node server is running. React app must be on a separate terminal.`);
});