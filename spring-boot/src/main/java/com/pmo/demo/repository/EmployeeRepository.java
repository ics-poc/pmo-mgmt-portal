package com.pmo.demo.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.pmo.demo.entity.EmployeeEntity;

@Repository
public interface EmployeeRepository extends JpaRepository<EmployeeEntity, String> {

	boolean existsByOfficialMailId(String officialMailId);
	
	Optional<EmployeeEntity> findByOfficialMailId(String officialMailId);
}
