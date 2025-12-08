package com.pmo.demo.domain;

public class DeleteResponse {
	
	private String message;
    private String candidateId;

    public DeleteResponse(String message, String candidateId) {
        this.message = message;
        this.candidateId = candidateId;
    }

    public String getMessage() { return message; }
    public String getCandidateId() { return candidateId; }
}
