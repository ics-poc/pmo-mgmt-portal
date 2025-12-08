package com.pmo.demo.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "br_employee_match", schema = "pmo")
@IdClass(BrEmployeeMatch.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BrEmployeeMatchEntity {

	@Id
    @Column(name = "auto_req_id", length = 50)
    private String autoReqId;

    @Id
    @Column(name = "emp_no", length = 50)
    private String empNo;

    @Id
    @Column(name = "skill_name", length = 255)
    private String skillName;

    @Column(name = "match_percent")
    private Float matchPercent;
}
