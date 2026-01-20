package com.pmo.demo.domain;

import java.util.ArrayList;
import java.util.List;

public class BrMatchResult {

    private String autoReqId;
    private List<CandidateMatch> candidates = new ArrayList<>();

    public BrMatchResult(String autoReqId) {
        this.autoReqId = autoReqId;
    }

    public void addCandidate(CandidateMatch candidate) {
        this.candidates.add(candidate);
    }

    public String getAutoReqId() {
        return autoReqId;
    }

    public List<CandidateMatch> getCandidates() {
        return candidates;
    }
}
