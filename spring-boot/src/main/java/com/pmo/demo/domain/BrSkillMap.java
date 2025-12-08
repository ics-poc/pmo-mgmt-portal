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
public class BrSkillMap {
	@JsonProperty("autoReqId")
	private String autoReqId;

	@JsonProperty("skillName")
	private String skillName;

	@JsonProperty("preferredFlag")
	private String preferredFlag;
}
