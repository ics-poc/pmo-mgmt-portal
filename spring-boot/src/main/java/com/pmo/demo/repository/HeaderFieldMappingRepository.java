package com.pmo.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pmo.demo.entity.HeaderFieldMappingEntity;

public interface HeaderFieldMappingRepository extends JpaRepository<HeaderFieldMappingEntity, Long> {

	List<HeaderFieldMappingEntity>findByEntityNameAndActiveTrue(String entityName);
}
