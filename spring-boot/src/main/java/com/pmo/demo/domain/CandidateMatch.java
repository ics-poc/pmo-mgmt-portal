package com.pmo.demo.domain;

public class CandidateMatch {

    private String employeeName;
    private String skillMatch; // keep as String or Map if needed

    public CandidateMatch(String employeeName, String skillMatch) {
        this.employeeName = employeeName;
        this.skillMatch = skillMatch;
    }

    public String getEmployeeName() {
        return employeeName;
    }

    public String getSkillMatch() {
        return skillMatch;
    }
}

