package com.pmo.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pmo.demo.entity.CandidateProfileEntity;

public interface CandidateProfileRepository extends JpaRepository<CandidateProfileEntity, Long> {

	List<CandidateProfileEntity> findByEmpNo(String empNo);
}
