package com.pmo.demo.serviceImpl;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.pmo.demo.domain.DeleteResponse;
import com.pmo.demo.domain.UploadResponse;
import com.pmo.demo.entity.CandidateProfileEntity;
import com.pmo.demo.entity.EmployeeEntity;
import com.pmo.demo.repository.CandidateProfileRepository;
import com.pmo.demo.repository.EmployeeRepository;
import com.pmo.demo.service.CandidateProfileService;

@Service
@Transactional
public class CandidateProfileServiceImpl implements CandidateProfileService {

	@Value("${file.storage.location}")
	private String STORAGE_DIRECTORY;

    @Autowired
    private CandidateProfileRepository documentRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Override
    public UploadResponse uploadDocument(MultipartFile file, String empNo, String uploadedBy) {
        try {

            String fileName = file.getOriginalFilename();
            if (fileName == null) {
                throw new RuntimeException("Invalid file.");
            }

            String lower = fileName.toLowerCase();
            if (!(lower.endsWith(".pdf") || lower.endsWith(".doc") || lower.endsWith(".docx"))) {
                throw new RuntimeException("Only PDF, DOC, and DOCX files are allowed.");
            }

            String contentType = file.getContentType();
            if (!(contentType.equals("application/pdf") ||
                    contentType.equals("application/msword") ||
                    contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document"))) {
                throw new RuntimeException("Invalid file type.");
            }

            Optional<EmployeeEntity> emp = employeeRepository.findById(empNo);
            if (emp.isEmpty()) {
                throw new RuntimeException("Employee with empNo " + empNo + " not found.");
            }

            Path empDir = Paths.get(STORAGE_DIRECTORY, empNo);
            Files.createDirectories(empDir);

            Path targetPath = empDir.resolve(fileName);
            Files.write(targetPath, file.getBytes());

            CandidateProfileEntity doc = new CandidateProfileEntity();
            doc.setEmpNo(empNo);
            doc.setFileName(fileName);
            doc.setUploadLocation(targetPath.toString());
            doc.setUploadedBy(uploadedBy);
            doc.setUploadDate(LocalDateTime.now());

            CandidateProfileEntity saved = documentRepository.save(doc);

            return new UploadResponse(
                    "Candidate file " + saved.getFileName() + " uploaded. Added 1 new candidate.",
                    saved.getCandidateProfileId()
            );

        } catch (IOException e) {
            throw new RuntimeException("Failed to upload file: " + e.getMessage(), e);
        }
    }

    @Override
    public List<CandidateProfileEntity> getDocumentsByEmpNo(String empNo) {
        return documentRepository.findByEmpNo(empNo);
    }

    @Override
    public byte[] downloadDocument(Long documentId) {
        CandidateProfileEntity doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found with id " + documentId));
        try {
            return Files.readAllBytes(Paths.get(doc.getUploadLocation()));
        } catch (IOException e) {
            throw new RuntimeException("Error reading file: " + e.getMessage(), e);
        }
    }
    
    @Override
    public DeleteResponse deleteDocumentsByEmpNo(String empNo) {
        try {
            List<CandidateProfileEntity> docs = documentRepository.findByEmpNo(empNo);

            String deletedFileName = "Resume";
            if (!docs.isEmpty()) {
                deletedFileName = docs.get(0).getFileName();
            }

            documentRepository.deleteAll(docs);

            Path empDir = Paths.get(STORAGE_DIRECTORY, empNo);

            if (Files.exists(empDir)) {
                Files.walk(empDir)
                    .sorted((a, b) -> b.compareTo(a))
                    .forEach(path -> {
                        try {
                            Files.delete(path);
                        } catch (IOException e) {
                            throw new RuntimeException("Failed to delete: " + path, e);
                        }
                    });
            }

            String message = String.format(
                    "Resume **%s** deleted successfully for candidate %s.",
                    deletedFileName,
                    empNo
            );

            return new DeleteResponse(message, empNo);

        } catch (IOException e) {
            throw new RuntimeException("Failed to delete folder: " + e.getMessage(), e);
        }
    }
}
