package com.pmo.demo.entity;

import java.math.BigDecimal;
import java.sql.Timestamp;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "br_data", schema = "pmo")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BrDataEntity {

	@Id
	@Column(name = "auto_req_id")
    private String autoReqId;

    @Column(name = "current_req_status", length = 50)
    private String currentReqStatus;

    @Column(name = "grade", length = 10)
    private String grade;

    @Column(name = "designation", length = 100)
    private String designation;

    @Column(name = "recruiter", length = 200)
    private String recruiter;

    @Column(name = "department_type", length = 100)
    private String departmentType;

    @Column(name = "bu", length = 100)
    private String bu;
    
    @Column(name = "client_interview", length = 10)
    private String clientInterview;

    @Column(name = "mandatory_skills")
    private String mandatorySkills;

    @Column(name = "entity", length = 50)
    private String entity;

    @Column(name = "client_name", length = 100)
    private String clientName;

    @Column(name = "billing_type", length = 50)
    private String billingType;

    @Column(name = "project", length = 100)
    private String project;

    @Column(name = "requester_id", length = 20)
    private String requesterId;

    @Column(name = "tag_manager", length = 200)
    private String tagManager;

    @Column(name = "rm_name", length = 100)
    private String rmName;

    @Column(name = "job_description", columnDefinition = "TEXT")
    private String jobDescription;

    @Column(name = "joining_location", length = 100)
    private String joiningLocation;

    @Column(name = "backfill_for_employee_name", length = 100)
    private String backfillForEmployeeName;

    @Column(name = "date_approved")
    private String dateApproved;

    @Column(name = "no_of_positions")
    private Integer noOfPositions;

    @Column(name = "positions_remaining")
    private Integer positionsRemaining;

    @Column(name = "sourcing_type", length = 50)
    private String sourcingType;

    @Column(name = "requirement_type", length = 50)
    private String requirementType;

    @Column(name = "st_bill_rate")
    private BigDecimal stBillRate;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSZ")
    @Column(name = "created_date", insertable = false, updatable = false)
    private Timestamp createdDate;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSZ")
    @Column(name = "modified_date", insertable = false, updatable = false)
    private Timestamp modifiedDate;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(name = "modified_by", length = 100)
    private String modifiedBy;
}
