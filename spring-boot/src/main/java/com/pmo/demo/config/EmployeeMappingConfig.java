package com.pmo.demo.config;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import lombok.Data;

@Configuration 
@ConfigurationProperties(prefix = "employee")
@Data
public class EmployeeMappingConfig {

	private List<String> columns;

    public Map<Integer, String> getIndexedColumns() {
        Map<Integer, String> map = new LinkedHashMap<>();
        for (int i = 0; i < columns.size(); i++) {
            map.put(i, columns.get(i));
        }
        return map;
    }
}
