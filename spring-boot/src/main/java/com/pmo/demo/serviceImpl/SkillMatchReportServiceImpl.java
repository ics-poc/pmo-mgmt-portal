package com.pmo.demo.serviceImpl;

import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pmo.demo.domain.BrMatchResult;
import com.pmo.demo.domain.CandidateMatch;
import com.pmo.demo.entity.BrDataEntity;
import com.pmo.demo.proxy.SkillsMatchProxy;
import com.pmo.demo.repository.BrDataRepository;
import com.pmo.demo.repository.EmployeeRepository;
import com.pmo.demo.service.SkillMatchReportService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SkillMatchReportServiceImpl implements SkillMatchReportService {

	private final BrDataRepository brDataRepository;

	private final EmployeeRepository employeeRepository;

	@Autowired
	private SkillsMatchProxy skillsMatchProxy;

	@Override
	public byte[] generateSkillMatchReport() {

		List<BrDataEntity> brList = brDataRepository.findAll();
		List<BrMatchResult> brMatchResults = new ArrayList<>();
		ObjectMapper mapper = new ObjectMapper();
		
		for (BrDataEntity br : brList) {

			ResponseEntity<String> response = skillsMatchProxy.proxyMatchSkills(br.getAutoReqId());
			System.out.println("Response from Python service:");
			System.out.println(response.getBody());

			JsonNode rootNode = null;
			try {
				rootNode = mapper.readTree(response.getBody());
			} catch (JsonMappingException e) {
				e.printStackTrace();
			} catch (JsonProcessingException e) {
				e.printStackTrace();
			}
		    String autoReqId = rootNode.get("autoReqid").asText();
		    JsonNode results = rootNode.get("results");
		    BrMatchResult brMatchResult = new BrMatchResult(autoReqId);

		    int count = 0;
		    Iterator<JsonNode> iterator = results.elements();

		    while (iterator.hasNext() && count < 5) {
		        JsonNode candidate = iterator.next();
		        String employeeName = candidate.get("employeeName").asText();
		        String skillMatch = candidate.get("skillMatch%").toString();

		        brMatchResult.addCandidate(
		                new CandidateMatch(employeeName, skillMatch)
		        );
		        count++;
		    }
		    brMatchResults.add(brMatchResult);
		}
		
		byte[] outputBytes = null;
		try {
			outputBytes = writeExcelToOutputStream(brMatchResults);
		} catch (Exception e) {
			e.printStackTrace();
		}
		return outputBytes;
	}
	
    public byte[] writeExcelToOutputStream(List<BrMatchResult> brMatchResults) throws Exception {

    	ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("BR Skill Match");
        Row headerRow = sheet.createRow(0);
        headerRow.createCell(0).setCellValue("autoReqId");

        for (int i = 1; i <= 5; i++) {
            headerRow.createCell(i).setCellValue("candidate-" + i);
        }

        int rowIndex = 1;
        for (BrMatchResult br : brMatchResults) {
            Row row = sheet.createRow(rowIndex++);
            row.createCell(0).setCellValue(br.getAutoReqId());
            int colIndex = 1;

            for (CandidateMatch candidate : br.getCandidates()) {
                if (colIndex > 5) break;
                String cellValue =
                        candidate.getEmployeeName() +
                        "(" + candidate.getSkillMatch() + ")";
                row.createCell(colIndex++).setCellValue(cellValue);
            }
        }
        for (int i = 0; i <= 5; i++) {
            sheet.autoSizeColumn(i);
        }
        workbook.write(baos);
        workbook.close();
        return baos.toByteArray();
    }
}