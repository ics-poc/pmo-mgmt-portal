package com.pmo.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.pmo.demo.entity.BrDataEntity;

@Repository
public interface BrDataRepository extends JpaRepository<BrDataEntity, String> {

}
