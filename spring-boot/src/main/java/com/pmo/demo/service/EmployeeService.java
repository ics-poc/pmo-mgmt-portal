package com.pmo.demo.service;

import java.util.List;
import java.util.Map;

import org.springframework.web.multipart.MultipartFile;

import com.pmo.demo.domain.Employee;

public interface EmployeeService {

	public Map<String, Object> uploadEmployees(MultipartFile file);

	List<Employee> getAllEmployees();

	Employee getEmployeeById(String empNo);

}
