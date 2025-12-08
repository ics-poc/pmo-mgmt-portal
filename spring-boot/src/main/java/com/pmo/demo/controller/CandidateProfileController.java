package com.pmo.demo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.pmo.demo.domain.DeleteResponse;
import com.pmo.demo.domain.UploadResponse;
import com.pmo.demo.entity.CandidateProfileEntity;
import com.pmo.demo.service.CandidateProfileService;

@RestController
@RequestMapping("/api/pmo/documents")
@CrossOrigin(origins = "*")
public class CandidateProfileController {

	@Autowired
    private CandidateProfileService documentService;

	@PostMapping(value="/upload", consumes = "multipart/form-data")
	public ResponseEntity<UploadResponse> uploadDocument(
	        @RequestParam("file") MultipartFile file,
	        @RequestParam("empNo") String empNo,
	        @RequestParam("uploadedBy") String uploadedBy) {

	    UploadResponse response = documentService.uploadDocument(file, empNo, uploadedBy);
	    return ResponseEntity.ok(response);
	}
    
    @GetMapping("/{empNo}")
    public ResponseEntity<List<CandidateProfileEntity>> getDocuments(@PathVariable String empNo) {
        return ResponseEntity.ok(documentService.getDocumentsByEmpNo(empNo));
    }
    
    @GetMapping("/download/{documentId}")
    public ResponseEntity<byte[]> downloadDocument(@PathVariable Long documentId) {
        byte[] fileBytes = documentService.downloadDocument(documentId);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=document_" + documentId + ".pdf")
                .body(fileBytes);
    }
    
    @DeleteMapping("/delete/{empNo}")
    public ResponseEntity<DeleteResponse> deleteDocuments(@PathVariable String empNo) {
        DeleteResponse response = documentService.deleteDocumentsByEmpNo(empNo);
        return ResponseEntity.ok(response);
    }
}
