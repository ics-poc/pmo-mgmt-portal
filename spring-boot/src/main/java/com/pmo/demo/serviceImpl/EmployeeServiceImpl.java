package com.pmo.demo.serviceImpl;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.pmo.demo.common.BeanMapper;
import com.pmo.demo.common.DynamicFieldSetter;
import com.pmo.demo.config.EmployeeMappingConfig;
import com.pmo.demo.domain.Employee;
import com.pmo.demo.entity.EmployeeEntity;
import com.pmo.demo.entity.HeaderFieldMappingEntity;
import com.pmo.demo.repository.EmployeeRepository;
import com.pmo.demo.repository.HeaderFieldMappingRepository;
import com.pmo.demo.service.EmployeeService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository empRepo;
    private final EmployeeMappingConfig config;
    private final DynamicFieldSetter setter;
    private final BeanMapper mapper;
    private final HeaderFieldMappingRepository headerMappingRepo;

    @Value("${employee.sheet-name}")
    private String empSheetName;

    @Override
    public Map<String, Object> uploadEmployees(MultipartFile file) {
        String n = file.getOriginalFilename().toLowerCase();
        if (n.endsWith(".csv")) return parseCsv(file);
        if (n.endsWith(".xlsx")) return parseExcel(file);
        return Map.of("status", "failed", "message", "Only .csv or .xlsx supported");
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
                    String empNo = stripBom(safeCsv(row, 0));
                    if (isBlank(empNo)) { skipped++; continue; }

                    EmployeeEntity e = empRepo.findById(empNo).orElse(new EmployeeEntity());

                    if (e.getCreatedDate() == null) {
                        e.setEmpNo(empNo);
                        e.setCreatedBy("admin");
                        e.setCreatedDate(new Timestamp(System.currentTimeMillis()));
                    } else {
                        e.setModifiedBy("admin");
                        e.setModifiedDate(new Timestamp(System.currentTimeMillis()));
                    }

                    for (Map.Entry<Integer, String> entry : indexToField.entrySet()) {
                        String value = stripBom(safeCsv(row, entry.getKey()));
                        setter.setField(e, entry.getValue(), value);
                    }

                    if (isBlank(e.getEmpNo())) {
                        throw new RuntimeException("Missing required field: empNo");
                    }

                    empRepo.save(e);
                    uploaded++;

                } catch (Exception ex) {
                    skipped++;
                    errors.add("Row " + row.getRecordNumber() + ": " + ex.getMessage());
                }
            }

        } catch (Exception ex) {
            errors.add("CSV read error: " + ex.getMessage());
        }

        return Map.of(
                "status", "done",
                "uploaded", uploaded,
                "skipped", skipped,
                "errors", errors
        );
    }

    private Map<String, Object> parseExcel(MultipartFile file) {
        int uploaded = 0, skipped = 0;
        List<String> errors = new ArrayList<>();

        try (Workbook wb = new XSSFWorkbook(file.getInputStream())) {

            Sheet sheet = wb.getSheet(empSheetName);
            if (sheet == null) throw new RuntimeException("Sheet '" + empSheetName + "' not found");

            Map<String, String> normalizedFieldMap = buildNormalizedFieldMap();
            Map<Integer, String> indexToField = new HashMap<>();

            // header row
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
                    String empNo = stripBom(getCell(row, 0));
                    if (isBlank(empNo)) { skipped++; continue; }

                    EmployeeEntity e = empRepo.findById(empNo).orElse(new EmployeeEntity());

                    if (e.getCreatedDate() == null) {
                        e.setEmpNo(empNo);
                        e.setCreatedBy("admin");
                        e.setCreatedDate(new Timestamp(System.currentTimeMillis()));
                    } else {
                        e.setModifiedBy("admin");
                        e.setModifiedDate(new Timestamp(System.currentTimeMillis()));
                    }

                    for (Map.Entry<Integer, String> entry : indexToField.entrySet()) {
                        String value = getCell(row, entry.getKey());
                        setter.setField(e, entry.getValue(), value);
                    }

                    if (isBlank(e.getEmpNo())) {
                        throw new RuntimeException("Missing required field: empNo");
                    }

                    empRepo.save(e);
                    uploaded++;

                } catch (Exception ex) {
                    skipped++;
                }
            }

        } catch (Exception ex) {
            errors.add("Excel read error: " + ex.getMessage());
        }

        return Map.of(
                "status", "done",
                "uploaded", uploaded,
                "skipped", skipped,
                "errors", errors
        );
    }

    @Override
    public List<Employee> getAllEmployees() {
        return empRepo.findAll().stream()
                .map(e -> mapper.copy(e, new Employee()))
                .toList();
    }

    @Override
    public Employee getEmployeeById(String empNo) {
        return empRepo.findById(empNo)
                .map(e -> mapper.copy(e, new Employee()))
                .orElseThrow(() -> new RuntimeException("Employee not found"));
    }

    private String getCell(Row row, int colIndex) {
        try {
            Cell c = row.getCell(colIndex);
            if (c == null) return "";

            if (c.getCellType() == CellType.NUMERIC) {
                return new BigDecimal(c.getNumericCellValue()).toPlainString();
            }

            return c.toString().trim();
        } catch (Exception e) {
            return "";
        }
    }

    private String safeCsv(CSVRecord r, int index) {
        try {
            return r.get(index).trim();
        } catch (Exception e) {
            return "";
        }
    }

    private String stripBom(String s) {
        return s == null ? "" : s.replace("\uFEFF", "");
    }

    private boolean isBlank(String v) {
        return v == null || v.trim().isEmpty();
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
}