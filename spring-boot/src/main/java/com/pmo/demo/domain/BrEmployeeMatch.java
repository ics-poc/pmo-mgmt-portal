package com.pmo.demo.domain;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BrEmployeeMatch {

	@JsonProperty("autoReqId")
	private String autoReqId;

	@JsonProperty("empNo")
	private String empNo;

	@JsonProperty("skillName")
	private String skillName;

	@JsonProperty("matchPercent")
	private Float matchPercent;
}
