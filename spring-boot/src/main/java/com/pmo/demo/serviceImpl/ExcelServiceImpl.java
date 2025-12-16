package com.pmo.demo.serviceImpl;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import com.pmo.demo.service.ExcelService;

@Service
public class ExcelServiceImpl implements ExcelService{

	@Override
    public byte[] createExcelFromJson(List<LinkedHashMap<String, Object>> rows) throws IOException {

        if (rows == null || rows.isEmpty()) rows = Collections.emptyList();

        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("data");

            LinkedHashSet<String> headers = new LinkedHashSet<>();
            if (!rows.isEmpty()) headers.addAll(rows.get(0).keySet());
            for (Map<String, Object> row : rows) headers.addAll(row.keySet());

            Row headerRow = sheet.createRow(0);
            CellStyle headerStyle = workbook.createCellStyle();
            Font bold = workbook.createFont();
            bold.setBold(true);
            headerStyle.setFont(bold);

            List<String> headerList = new ArrayList<>(headers);
            int colIdx = 0;
            for (String header : headerList) {
                Cell cell = headerRow.createCell(colIdx++);
                cell.setCellValue(header);
                cell.setCellStyle(headerStyle);
            }

            int rowIdx = 1;
            for (Map<String, Object> map : rows) {
                Row excelRow = sheet.createRow(rowIdx++);
                colIdx = 0;

                for (String header : headerList) {
                    Cell cell = excelRow.createCell(colIdx++);
                    Object value = map.get(header);

                    if (value == null) cell.setCellValue("");
                    else if (value instanceof Number) cell.setCellValue(((Number) value).doubleValue());
                    else if (value instanceof Boolean) cell.setCellValue((Boolean) value);
                    else cell.setCellValue(value.toString());
                }
            }

            for (int i = 0; i < headerList.size(); i++) sheet.autoSizeColumn(i);

            workbook.write(out);
            return out.toByteArray();
        }
    }
}
