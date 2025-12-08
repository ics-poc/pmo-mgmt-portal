package com.pmo.demo.common;

import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

import org.springframework.stereotype.Component;

@Component
public class DynamicFieldSetter {

	public void setField(Object entity, String fieldName, String rawValue) {
        if (fieldName == null || fieldName.isBlank()) return;

        try {
            Field field = entity.getClass().getDeclaredField(fieldName);
            field.setAccessible(true);

            Class<?> type = field.getType();

            if (type.equals(String.class)) {
                field.set(entity, rawValue);

            } else if (type.equals(Integer.class)) {
                field.set(entity, parseInt(rawValue));

            } else if (type.equals(BigDecimal.class)) {
                field.set(entity, parseDecimal(rawValue));

            } else if (type.equals(LocalDate.class)) {
                field.set(entity, parseLocalDate(rawValue));

            } else if (type.equals(Timestamp.class)) {
                field.set(entity, parseTimestamp(rawValue));

            } else {
                field.set(entity, rawValue); 
            }

        } catch (NoSuchFieldException ignored) {
        } catch (Exception e) {
            throw new RuntimeException("Error setting field '" + fieldName + "'", e);
        }
    }

    private Integer parseInt(String v) {
        try { return (v == null || v.isBlank()) ? null : Integer.parseInt(v.split("\\.")[0]); }
        catch (Exception e) { return null; }
    }

    private BigDecimal parseDecimal(String v) {
        try { return (v == null || v.isBlank()) ? null : new BigDecimal(v.trim()); }
        catch (Exception e) { return null; }
    }

    private LocalDate parseLocalDate(String v) {
        try { return (v == null || v.isBlank()) ? null : LocalDate.parse(v, DateTimeFormatter.ofPattern("dd-MMM-yy")); }
        catch (Exception e) { return null; }
    }

    private Timestamp parseTimestamp(String v) {
        try { return (v == null || v.isBlank()) ? null : Timestamp.valueOf(v); }
        catch (Exception e) { return null; }
    }
}
