package com.pmo.demo.entity;

import java.sql.Timestamp;
import java.time.LocalDate;

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
@Table(name = "employees", schema = "pmo")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeEntity {

	@Id
    @Column(name = "emp_no", length = 30, nullable = false)
    private String empNo;

    @Column(name = "emp_name", length = 255)
    private String empName;

    @Column(name = "grade", length = 50)
    private String grade;

    @Column(name = "cumulative_rating", length = 50)
    private String cumulativeRating;

    @Column(name = "appraisal_rating", length = 50)
    private String appraisalRating;

    @Column(name = "previous_rm_name", length = 255)
    private String previousRmName;

    @Column(name = "br")
    private String br;

    @Column(name = "designation", length = 200)
    private String designation;

    @Column(name = "official_mail_id", length = 255, unique = true)
    private String officialMailId;

    @Column(name = "phone_number", length = 30)
    private String phoneNumber;

    @Column(name = "business_unit", length = 200)
    private String businessUnit;

    @Column(name = "previous_client", length = 200)
    private String previousClient;
    
    @Column(name = "sbu", length = 200)
    private String sbu;

    @Column(name = "top_3_skills", columnDefinition = "TEXT")
    private String top3Skills;

    @Column(name = "rating_out_of_10_for_top_3_skills", length = 200)
    private String ratingOutOf10ForTop3Skills;

    @Column(name = "skills_category", length = 255)
    private String skillsCategory;

    @Column(name = "skills_bucket", length = 255)
    private String skillsBucket;

    @Column(name = "detailed_skills", columnDefinition = "TEXT")
    private String detailedSkills;

    @Column(name = "infinite_doj")
    private LocalDate infiniteDoj;

    @Column(name = "received_date")
    private LocalDate receivedDate;

    @Column(name = "lwd")
    private LocalDate lwd;

    @Column(name = "status", length = 100)
    private String status;

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "deployed_exit_month", length = 50)
    private String deployedExitMonth;

    @Column(name = "deployed_exit_date1")
    private String deployedExitDate1;
    
    @Column(name = "deployed_client", length = 255)
    private String deployedClient;

    @Column(name = "reason_for_movement_to_corp_pool", columnDefinition = "TEXT")
    private String reasonForMovementToCorpPool;

    @Column(name = "current_location", length = 200)
    private String currentLocation;

    @Column(name = "preferred_location", length = 200)
    private String preferredLocation;

    @Column(name = "office_location", length = 200)
    private String officeLocation;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSZ")
    @Column(name = "created_date", insertable = false, updatable = false)
    private Timestamp createdDate;

    @Column(name = "modified_by", length = 100)
    private String modifiedBy;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSZ")
    @Column(name = "modified_date", insertable = false, updatable = false)
    private Timestamp modifiedDate;
}
