package com.pmo.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.pmo.demo.entity.BrSkillMapEntity;

@Repository
public interface BrSkillMapRepository extends JpaRepository<BrSkillMapEntity, String> {
	List<BrSkillMapEntity> findByAutoReqId(String autoReqId);
}
