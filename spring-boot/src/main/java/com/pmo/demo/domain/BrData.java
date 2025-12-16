package com.pmo.demo.domain;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BrData {
	
	@JsonProperty("autoReqId")
    private String autoReqId;

    @JsonProperty("currentReqStatus")
    private String currentReqStatus;

    private String grade;
    private String designation;
    private String recruiter;
    private String departmentType;
    private String bu;
    private String clientInterview;
    private String mandatorySkills;
    private String entity;
    private String clientName;
    private String billingType;
    private String project;
    private String requesterId;
    private String tagManager;
    private String rmName;
    private String jobDescription;
    private String joiningLocation;
    private String backfillForEmployeeName;
    private String dateApproved;
    private Integer noOfPositions;
    private Integer positionsRemaining;
    private String sourcingType;
    private String requirementType;
    private BigDecimal stBillRate;
}
