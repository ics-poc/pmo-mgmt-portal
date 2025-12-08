package com.pmo.demo.controller;

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pmo.demo.domain.BrEmployeeMatch;
import com.pmo.demo.domain.EmployeeSkillResponse;
import com.pmo.demo.service.BrEmployeeMatchService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/brEmployeeMatch")
@RequiredArgsConstructor
public class BrEmployeeMatchController {

	private final BrEmployeeMatchService brEmployeeMatchService;

	@GetMapping("/all")
	public List<BrEmployeeMatch> getAllMatches() {
		return brEmployeeMatchService.getAllMatches();
	}

	@GetMapping("/{autoReqId}")
	public EmployeeSkillResponse getEmployeeSkillDetails(@PathVariable String autoReqId) {
		return brEmployeeMatchService.getEmployeeSkillDetails(autoReqId);
	}
}
