package com.pmo.demo.service;

import java.util.List;
import java.util.Map;

import org.springframework.web.multipart.MultipartFile;

import com.pmo.demo.domain.BrData;

public interface BrDataService {

	Map<String, Object> uploadBrData(MultipartFile file);

	List<BrData> getAllData();

	BrData getDataById(String autoReqId);
}
