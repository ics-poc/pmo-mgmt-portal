package com.pmo.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.pmo.demo.entity.BrEmployeeMatch;
import com.pmo.demo.entity.BrEmployeeMatchEntity;

@Repository
public interface BrEmployeeMatchRepository extends JpaRepository<BrEmployeeMatchEntity, BrEmployeeMatch> {
	List<BrEmployeeMatchEntity> findByAutoReqId(String autoReqId);

	List<BrEmployeeMatchEntity> findByAutoReqIdAndEmpNo(String autoReqId, String empNo);
}
