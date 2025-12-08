package com.pmo.demo.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.pmo.demo.domain.DeleteResponse;
import com.pmo.demo.domain.UploadResponse;
import com.pmo.demo.entity.CandidateProfileEntity;

public interface CandidateProfileService {

	UploadResponse uploadDocument(MultipartFile file, String empNo, String uploadedBy);

    List<CandidateProfileEntity> getDocumentsByEmpNo(String empNo);
    byte[] downloadDocument(Long documentId);
    
    DeleteResponse deleteDocumentsByEmpNo(String empNo);
}
