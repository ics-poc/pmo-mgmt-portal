package com.pmo.demo.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.pmo.demo.domain.Employee;
import com.pmo.demo.service.EmployeeService;

@RestController
@RequestMapping("/employee")
@CrossOrigin(origins = "http://localhost:3000")
public class EmployeeController {
	private final EmployeeService employeeService;

	public EmployeeController(EmployeeService employeeService) {
		this.employeeService = employeeService;
	}

	@GetMapping
	public List<Employee> getAllEmployees() {
		return employeeService.getAllEmployees();
	}

	@GetMapping("/{empNo}")
	public ResponseEntity<Employee> getEmployeeById(@PathVariable String empNo) {
		Employee employee = employeeService.getEmployeeById(empNo);
		return ResponseEntity.ok(employee);
	}
	
	@PostMapping(value= "/upload", consumes = "multipart/form-data")
    public ResponseEntity<Map<String, Object>> uploadEmployees(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(employeeService.uploadEmployees(file));
    }
}
