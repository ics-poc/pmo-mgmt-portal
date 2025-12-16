package com.pmo.demo.controller;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pmo.demo.service.ExcelService;

@RestController
@RequestMapping("/api/excel")
public class ExcelController {

	@Autowired
    private ExcelService excelService;

    @PostMapping("/generate")
    public ResponseEntity<byte[]> generateExcel(@RequestBody List<LinkedHashMap<String, Object>> jsonList) throws IOException {

        byte[] excelBytes = excelService.createExcelFromJson(jsonList);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=data.xlsx");

        return ResponseEntity.ok()
                .headers(headers)
                .body(excelBytes);
    }
}
