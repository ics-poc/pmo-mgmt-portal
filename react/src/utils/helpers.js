// // src/utils/helpers.js

// /** Base URL for your Node server */
export const API_URL = 'http://localhost:8081'; 
export const AI_API_URL = 'http://localhost:8000';
export const NODE_API_URL = 'http://localhost:3001';

// /** Global Back Button Style used across multiple components */
export const ICON_BACK_BUTTON_STYLE = {
    background: 'white',
    color: '#0066cc',
    border: '1px solid #0066cc',
    padding: '5px 10px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1.0em',
    fontWeight: 'bold',
    transition: 'all 0.2s',
    marginBottom: '10px', 
    marginRight: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
};

// /**
//  * Parses a string of skills into a clean array of unique, lowercase skills.
//  * @param {string} skillsString - The raw string from job requirements or candidate data.
//  * @returns {Array<string>} - Array of cleaned skill strings.
//  */
export const parseSkills = (skillsString) => {
    if (!skillsString) return [];
    return Array.from(new Set(skillsString
        .replace(/ and /gi, ',')
        .replace(/\s*\/\s*/g, ',')
        .replace(/:\s*/g, ',')
        .split(/, |,|&|\n|[\s,]+/)
        .map(skill => skill.trim().toLowerCase())
        .filter(skill => skill.length > 1)
    ));
};

// /**
//  * Filters and shortlists candidates based on required skills.
//  * @param {string} requiredSkillsString - Comma-separated string of required skills.
//  * @param {Array<object>} candidates - The full pool of candidate data.
//  * @returns {Array<object>} - Shortlisted and sorted candidates with skillMatch scores.
//  */
export const filterCandidates = (requiredSkillsString, candidates) => {
    if (!requiredSkillsString) return [];

    const requiredSkills = requiredSkillsString
        .split(',')
        .map(s => s.trim().toLowerCase())
        .filter(s => s.length > 0);
        
    if (requiredSkills.length === 0) return [];

    const shortlisted = candidates.map(candidate => {
        
        const combinedSkillsArray = [
            ...parseSkills(candidate.skill || ''),
            ...parseSkills(candidate.subSkill || '')
        ];
        const uniqueCandidateSkills = Array.from(new Set(combinedSkillsArray));
        
        let matchCount = 0;

        requiredSkills.forEach(reqSkill => {
            if (uniqueCandidateSkills.some(candSkill => candSkill.includes(reqSkill) || reqSkill.includes(candSkill))) {
                 matchCount++;
            }
        });

        const skillMatch = (matchCount / requiredSkills.length) * 100;
        
        return { 
            candidateName: candidate.candidateName,
            skills: uniqueCandidateSkills.join(', '), 
            skillMatch: Math.round(skillMatch),
            id: candidate.id, 
            data: candidate 
        };
    }).filter(c => c.skillMatch > 0); 

    shortlisted.sort((a, b) => b.skillMatch - a.skillMatch);
    
    return shortlisted;
};