package com.pmo.demo.service;

import java.util.List;

import com.pmo.demo.domain.BrEmployeeMatch;
import com.pmo.demo.domain.EmployeeSkillResponse;

public interface BrEmployeeMatchService {
	List<BrEmployeeMatch> getAllMatches();

	EmployeeSkillResponse getEmployeeSkillDetails(String autoReqId);
}
