package com.pmo.demo.domain;

public class UploadResponse {

	private String message;
    private Long candidateId;

    public UploadResponse(String message, Long newCandidateId) {
        this.message = message;
        this.candidateId = newCandidateId;
    }

    public String getMessage() { return message; }
    public Long getNewCandidateId() { return candidateId; }
}
