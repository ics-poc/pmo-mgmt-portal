package com.pmo.demo.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "candidate_profile_document", schema = "pmo")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CandidateProfileEntity {

	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "candidate_profile_document_id")
    private Long candidateProfileId;

    @Column(name = "emp_no", nullable = false, length = 30)
    private String empNo;

    @Column(name = "file_name", nullable = false, length = 255)
    private String fileName;

    @Column(name = "upload_location", nullable = false, length = 512)
    private String uploadLocation;

    @Column(name = "uploaded_by", length = 255)
    private String uploadedBy;

    @Column(name = "upload_date")
    private LocalDateTime uploadDate = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "emp_no", referencedColumnName = "emp_no", insertable = false, updatable = false)
    private EmployeeEntity employee;
}
