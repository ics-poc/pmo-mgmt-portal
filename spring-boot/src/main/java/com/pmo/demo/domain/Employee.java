package com.pmo.demo.domain;

import java.sql.Date;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Employee {
	
	@JsonProperty("empNo")
    private String empNo;

    @JsonProperty("empName")
    private String empName;

    private String grade;
    private String cumulativeRating;
    private String appraisalRating;
    private String rmName;
    private String br;
    private String designation;
    private String officialMailId;
    private String phoneNumber;
    private String businessUnit;
    private String client;
    private String top3Skills;
    private String ratingOutOf10ForTop3Skills;
    private String skillsCategory;
    private String skillBucket;
    private String detailedSkills;
    private Date infiniteDoj;
    private Date receivedDate;
    private String lwd;
    private String status;
    private String remarks;
    private String deployedExitMonth;
    private String deployedExitDate1;
    private String deployedClient;
    private String reasonForMovementToCorpPool;
    private String currentLocation;
    private String preferredLocation;
    private String officeLocation;
}
