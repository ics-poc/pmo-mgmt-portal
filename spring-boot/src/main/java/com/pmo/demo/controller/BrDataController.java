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

import com.pmo.demo.domain.BrData;
import com.pmo.demo.service.BrDataService;

@RestController
@RequestMapping("/brdata")
public class BrDataController {
	
	private final BrDataService brDataService;

	public BrDataController(BrDataService brDataService) {
		this.brDataService = brDataService;
	}

	@GetMapping
	public ResponseEntity<List<BrData>> getAllData() {
		return ResponseEntity.ok(brDataService.getAllData());
	}

	@GetMapping("/{autoReqId}")
	public ResponseEntity<BrData> getDataById(@PathVariable String autoReqId) {
		BrData data = brDataService.getDataById(autoReqId);
		return ResponseEntity.ok(data);
	}
	
	@PostMapping(value= "/upload", consumes = "multipart/form-data")
    public ResponseEntity<Map<String, Object>> uploadBrData(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(brDataService.uploadBrData(file));
    }
}