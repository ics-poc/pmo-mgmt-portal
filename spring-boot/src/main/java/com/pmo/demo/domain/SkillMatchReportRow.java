package com.pmo.demo.domain;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SkillMatchReportRow {

	private String autoReqId;
    private String employeeName;
    private Double skillMatchPercentage;
    private Integer rank;
}
