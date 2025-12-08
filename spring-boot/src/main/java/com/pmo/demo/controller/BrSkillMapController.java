package com.pmo.demo.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pmo.demo.domain.BrSkillMap;
import com.pmo.demo.service.BrSkillMapService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/brSkillMap")
@RequiredArgsConstructor
public class BrSkillMapController {

	private final BrSkillMapService brSkillMapService;

	@GetMapping("/all")
	public List<BrSkillMap> getAllSkills() {
		return brSkillMapService.getAllSkills();
	}
}
