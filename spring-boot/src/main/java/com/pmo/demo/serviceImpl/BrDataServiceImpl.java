package com.pmo.demo.serviceImpl;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.HashMap;
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
import com.pmo.demo.entity.HeaderFieldMappingEntity;
import com.pmo.demo.repository.BrDataRepository;
import com.pmo.demo.repository.HeaderFieldMappingRepository;
import com.pmo.demo.service.BrDataService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BrDataServiceImpl implements BrDataService {

    private final BrDataRepository brRepo;
    private final BrDataMappingConfig config;
    private final DynamicFieldSetter setter;
    private final BeanMapper mapper;
    private final HeaderFieldMappingRepository headerMappingRepo;

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
                     .setTrim(true)
                     .build()
                     .parse(br)) {

            Map<String, String> normalizedFieldMap = buildNormalizedFieldMap();
            Map<Integer, String> indexToField = new HashMap<>();

            boolean headerProcessed = false;

            for (CSVRecord row : parser) {

                if (!headerProcessed) {
                    for (int i = 0; i < row.size(); i++) {
                        String header = normalize(row.get(i));
                        if (normalizedFieldMap.containsKey(header)) {
                            indexToField.put(i, normalizedFieldMap.get(header));
                        }
                    }
                    headerProcessed = true;
                    continue;
                }

                try {
                    String id = stripBom(safe(row.get(0)));
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

                    for (Map.Entry<Integer, String> entry : indexToField.entrySet()) {
                        String value = stripBom(safe(row.get(entry.getKey())));
                        setter.setField(e, entry.getValue(), value);
                    }

                    if (e.getAutoReqId() == null || e.getAutoReqId().isBlank()) {
                        throw new RuntimeException("Missing required field: autoReqId");
                    }

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


    private Map<String, Object> parseExcel(MultipartFile file) {
        int uploaded = 0, skipped = 0;
        List<String> errors = new ArrayList<>();

        try (Workbook wb = new XSSFWorkbook(file.getInputStream())) {

            Sheet sheet = wb.getSheet(brSheetName);
            if (sheet == null) throw new RuntimeException("Sheet '" + brSheetName + "' not found");

            Map<String, String> normalizedFieldMap = buildNormalizedFieldMap();
            Map<Integer, String> indexToField = new HashMap<>();

            Row headerRow = sheet.getRow(0);
            for (int i = 0; i < headerRow.getLastCellNum(); i++) {
                String header = normalize(getCell(headerRow, i));
                if (normalizedFieldMap.containsKey(header)) {
                    indexToField.put(i, normalizedFieldMap.get(header));
                }
            }

            for (Row row : sheet) {
                if (row.getRowNum() == 0) continue;

                try {
                    String id = stripBom(safe(getCell(row, 0)));
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

                    for (Map.Entry<Integer, String> entry : indexToField.entrySet()) {
                        String value = safe(getCell(row, entry.getKey()));
                        setter.setField(e, entry.getValue(), value);
                    }

                    if (e.getAutoReqId() == null || e.getAutoReqId().isBlank()) {
                        throw new RuntimeException("Missing required field: autoReqId");
                    }

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

    private String safe(String v) {
        return v == null ? "" : v.trim();
    }

    private String stripBom(String s) {
        return s == null ? "" : s.replace("\uFEFF", "");
    }

    private String getCell(Row row, int colIndex) {
        try {
            Cell c = row.getCell(colIndex);
            return c == null ? "" : c.toString().trim();
        } catch (Exception e) {
            return "";
        }
    }

    private String normalize(String s) {
        if (s == null) return "";
        return s
                .replace("\uFEFF", "")
                .trim()
                .toLowerCase()
                .replaceAll("[^a-z0-9]", "");
    }

    private Map<String, String> buildNormalizedFieldMap() {
        Map<String, String> map = new HashMap<>();

        List<HeaderFieldMappingEntity> mappings =
                headerMappingRepo.findByEntityNameAndActiveTrue(config.getEntityName());

        for (HeaderFieldMappingEntity m : mappings) {
            map.put(
                normalize(m.getHeaderName()),
                m.getEntityFieldName()
            );
        }

        return map;
    }

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
}
