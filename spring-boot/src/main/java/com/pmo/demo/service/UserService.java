package com.pmo.demo.service;

import com.pmo.demo.entity.UserEntity;

public interface UserService {

    UserEntity login(String username, String password);
}
