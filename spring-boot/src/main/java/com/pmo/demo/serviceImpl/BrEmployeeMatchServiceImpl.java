package com.pmo.demo.serviceImpl;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.pmo.demo.domain.BrEmployeeMatch;
import com.pmo.demo.domain.EmployeeSkillResponse;
import com.pmo.demo.entity.BrEmployeeMatchEntity;
import com.pmo.demo.entity.BrSkillMapEntity;
import com.pmo.demo.repository.BrEmployeeMatchRepository;
import com.pmo.demo.repository.BrSkillMapRepository;
import com.pmo.demo.service.BrEmployeeMatchService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BrEmployeeMatchServiceImpl implements BrEmployeeMatchService {

	private final BrEmployeeMatchRepository brEmployeeMatchRepository;
	private final BrSkillMapRepository brSkillMapRepository;

	@Override
	public List<BrEmployeeMatch> getAllMatches() {
		return brEmployeeMatchRepository.findAll().stream().map(this::convertToDto).toList();
	}

	private BrEmployeeMatch convertToDto(BrEmployeeMatchEntity entity) {
		BrEmployeeMatch dto = new BrEmployeeMatch();
		dto.setAutoReqId(entity.getAutoReqId());
		dto.setEmpNo(entity.getEmpNo());
		dto.setSkillName(entity.getSkillName());
		dto.setMatchPercent(entity.getMatchPercent());
		return dto;
	}

	// Returns all employees under a given autoReqId along with each employee's
	// skills, match percentage, and whether the skill is preferred or not.
	@Override
	public EmployeeSkillResponse getEmployeeSkillDetails(String autoReqId) {

		List<BrEmployeeMatchEntity> matches = brEmployeeMatchRepository.findByAutoReqId(autoReqId);

		List<BrSkillMapEntity> skillMaps = brSkillMapRepository.findByAutoReqId(autoReqId);

		Map<String, String> preferredFlagMap = skillMaps.stream().collect(
				Collectors.toMap(BrSkillMapEntity::getSkillName, BrSkillMapEntity::getPreferredFlag, (a, b) -> a));

		Map<String, List<BrEmployeeMatchEntity>> grouped = matches.stream()
				.collect(Collectors.groupingBy(BrEmployeeMatchEntity::getEmpNo));

		List<EmployeeSkillResponse.EmployeeDetail> employees = grouped.entrySet().stream().map(entry -> {
			String empNo = entry.getKey();
			List<BrEmployeeMatchEntity> empSkills = entry.getValue();

			List<EmployeeSkillResponse.SkillDetail> skillDetails = empSkills
					.stream().map(skill -> new EmployeeSkillResponse.SkillDetail(skill.getSkillName(),
							skill.getMatchPercent(), preferredFlagMap.getOrDefault(skill.getSkillName(), "N")))
					.collect(Collectors.toList());

			return new EmployeeSkillResponse.EmployeeDetail(empNo, skillDetails);
		}).collect(Collectors.toList());

		return new EmployeeSkillResponse(autoReqId, employees);
	}
}
