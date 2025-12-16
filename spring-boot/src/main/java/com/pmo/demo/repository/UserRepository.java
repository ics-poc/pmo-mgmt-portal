package com.pmo.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pmo.demo.entity.UserEntity;

public interface UserRepository extends JpaRepository<UserEntity, Long> {

    UserEntity findByUsername(String username);
}
