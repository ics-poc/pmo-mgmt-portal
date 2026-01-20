package com.pmo.demo.controller;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pmo.demo.service.SkillMatchReportService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/pmo/report")
@RequiredArgsConstructor
public class SkillMatchReportController {

	private final SkillMatchReportService service;

    @GetMapping("/generate")
    public ResponseEntity<byte[]> generateReport() {

        byte[] csv = service.generateSkillMatchReport();

        return ResponseEntity.ok()
                .header("Content-Disposition",
                        "attachment; filename=br_candidate_skill_match.csv")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(csv);
    }
}
