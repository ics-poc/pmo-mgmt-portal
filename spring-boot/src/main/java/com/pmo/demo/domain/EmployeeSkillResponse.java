package com.pmo.demo.domain;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeSkillResponse {
	private String autoReqId;
	private List<EmployeeDetail> employees;

	@Getter
	@Setter
	@NoArgsConstructor
	@AllArgsConstructor
	public static class EmployeeDetail {
		private String empNo;
		private List<SkillDetail> skills;
	}

	@Getter
	@Setter
	@NoArgsConstructor
	@AllArgsConstructor
	public static class SkillDetail {
		private String skillName;
		private Float matchPercent;
		private String preferredFlag;
	}
}
