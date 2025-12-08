package com.pmo.demo.serviceImpl;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.pmo.demo.common.BeanMapper;
import com.pmo.demo.common.DynamicFieldSetter;
import com.pmo.demo.config.BrDataMappingConfig;
import com.pmo.demo.domain.BrData;
import com.pmo.demo.entity.BrDataEntity;
import com.pmo.demo.repository.BrDataRepository;
import com.pmo.demo.service.BrDataService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BrDataServiceImpl implements BrDataService {

	private final BrDataRepository brRepo;
	private final BrDataMappingConfig config;
    private final DynamicFieldSetter setter;
    private final BeanMapper mapper;
    
    @Value("${brdata.sheet-name}")
    private String brSheetName;

    @Override
    public Map<String, Object> uploadBrData(MultipartFile file) {
        String name = file.getOriginalFilename().toLowerCase();
        if (name.endsWith(".csv")) return parseCsv(file);
        if (name.endsWith(".xlsx")) return parseExcel(file);
        return Map.of("status", "failed", "message", "Only .csv or .xlsx files supported");
    }

    private Map<String, Object> parseCsv(MultipartFile file) {
        int uploaded = 0, skipped = 0;
        List<String> errors = new ArrayList<>();

        try (BufferedReader br = new BufferedReader(new InputStreamReader(file.getInputStream()));
             CSVParser parser = CSVFormat.DEFAULT
                     .builder()
                     .setSkipHeaderRecord(true)
                     .setTrim(true)
                     .build()
                     .parse(br)) {

            boolean first = true;

            for (CSVRecord row : parser) {

                if (first) { 
                    first = false; 
                    continue;
                }

                try {
                    String id = stripBom(safe(getCsvValue(row, 0))); 

                    if (id.isBlank()) { skipped++; continue; }

                    BrDataEntity e = brRepo.findById(id).orElse(new BrDataEntity());

                    if (e.getCreatedDate() == null) {
                        e.setCreatedBy("admin");
                        e.setCreatedDate(new Timestamp(System.currentTimeMillis()));
                    } else {
                        e.setModifiedBy("admin");
                        e.setModifiedDate(new Timestamp(System.currentTimeMillis()));
                    }

                    for (Map.Entry<Integer, String> entry : config.getIndexedColumns().entrySet()) {
                        int colIndex = entry.getKey();
                        String fieldName = entry.getValue();

                        String value = stripBom(safe(getCsvValue(row, colIndex)));
                        setter.setField(e, fieldName, value);
                    }

                    e.setAutoReqId(id);
                    brRepo.save(e);
                    uploaded++;

                } catch (Exception ex) {
                    skipped++;
                    errors.add("Row " + row.getRecordNumber() + ": " + ex.getMessage());
                }
            }

        } catch (Exception ex) {
            errors.add("CSV read error: " + ex.getMessage());
        }

        return Map.of("status", "done", "uploaded", uploaded, "skipped", skipped, "errors", errors);
    }

    private String getCsvValue(CSVRecord r, int index) {
        try { return r.get(index); }
        catch (Exception e) { return ""; }
    }
    
    private String stripBom(String s) {
        if (s == null) return "";
        return s.replace("\uFEFF", "");
    }

    private Map<String, Object> parseExcel(MultipartFile file) {
        int uploaded = 0, skipped = 0;
        List<String> errors = new ArrayList<>();

        try (Workbook wb = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = wb.getSheet(brSheetName);
            if (sheet == null) throw new RuntimeException("Sheet '" + brSheetName + "' not found");

            for (Row row : sheet) {
                if (row.getRowNum() == 0) continue;

                try {
                    String id = getCell(row, 0);
                    if (id.isBlank()) { skipped++; continue; }

                    BrDataEntity e = brRepo.findById(id).orElse(new BrDataEntity());

                    if (e.getCreatedDate() == null) {
                    	e.setAutoReqId(id);
                        e.setCreatedBy("admin");
                        e.setCreatedDate(new Timestamp(System.currentTimeMillis()));
                    } else {
                        e.setModifiedBy("admin");
                        e.setModifiedDate(new Timestamp(System.currentTimeMillis()));
                    }

                    for (Map.Entry<Integer, String> entry : config.getIndexedColumns().entrySet()) {

                        int colIndex = entry.getKey();
                        String fieldName = entry.getValue();

                        String value = getCell(row, colIndex);
                        setter.setField(e, fieldName, value);
                    }

                    e.setAutoReqId(id);
                    brRepo.save(e);
                    uploaded++;

                } catch (Exception ex) {
                    skipped++;
                    errors.add("Row " + row.getRowNum() + ": " + ex.getMessage());
                }
            }

        } catch (Exception ex) {
            errors.add("Excel read error: " + ex.getMessage());
        }

        return Map.of("status", "done", "uploaded", uploaded, "skipped", skipped, "errors", errors);
    }


    private String safe(String v) { return v == null ? "" : v.trim(); }

    @Override
    public List<BrData> getAllData() {
        return brRepo.findAll().stream()
                .map(e -> mapper.copy(e, new BrData()))
                .toList();
    }

    @Override
    public BrData getDataById(String autoReqId) {
        return brRepo.findById(autoReqId)
                .map(e -> mapper.copy(e, new BrData()))
                .orElseThrow(() -> new RuntimeException("BR Data not found for ID: " + autoReqId));
    }
    
    private String getCell(Row row, int colIndex) {
        try {
            Cell c = row.getCell(colIndex);
            return c == null ? "" : c.toString().trim();
        } catch (Exception e) {
            return "";
        }
    }

}
