package com.pmo.demo.serviceImpl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.pmo.demo.domain.BrSkillMap;
import com.pmo.demo.repository.BrSkillMapRepository;
import com.pmo.demo.service.BrSkillMapService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BrSkillMapServiceImpl implements BrSkillMapService {

	private final BrSkillMapRepository brSkillMapRepository;

	@Override
	public List<BrSkillMap> getAllSkills() {
		return brSkillMapRepository.findAll().stream()
				.map(entity -> new BrSkillMap(entity.getAutoReqId(), entity.getSkillName(), entity.getPreferredFlag()))
				.collect(Collectors.toList());
	}
}
