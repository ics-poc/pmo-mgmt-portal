package com.pmo.demo.service;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.List;

public interface ExcelService {

	byte[] createExcelFromJson(List<LinkedHashMap<String, Object>> jsonList) throws IOException;
}
