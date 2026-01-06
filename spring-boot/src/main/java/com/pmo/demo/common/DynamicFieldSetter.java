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
                field.set(entity, clean(rawValue));

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

    private String clean(String v) {
        return (v == null) ? null : v.trim();
    }

    private Integer parseInt(String v) {
        try {
            if (v == null || v.isBlank()) return null;

            BigDecimal bd = new BigDecimal(v.trim());
            return bd.intValue(); 
        } catch (Exception e) {
            return null;
        }
    }


    private BigDecimal parseDecimal(String v) {
        try {
            if (v == null || v.isBlank()) return null;

            String cleaned = v.replaceAll("[^0-9.]", "");
            if (cleaned.isBlank()) return BigDecimal.ZERO;

            return new BigDecimal(cleaned);
        } catch (Exception e) {
            return null;
        }
    }

    private LocalDate parseLocalDate(String v) {
        try {
            if (v == null || v.isBlank()) return null;

            if (v.matches("\\d+(\\.\\d+)?")) {
                double excelDate = Double.parseDouble(v);
                return LocalDate.of(1899, 12, 30).plusDays((long) excelDate);
            }

            DateTimeFormatter[] formats = new DateTimeFormatter[] {
                DateTimeFormatter.ofPattern("dd-MMM-yy"),
                DateTimeFormatter.ofPattern("dd-MM-yyyy"),
                DateTimeFormatter.ofPattern("dd/MM/yyyy"),
                DateTimeFormatter.ofPattern("yyyy-MM-dd"),
                DateTimeFormatter.ofPattern("MM/dd/yyyy")
            };

            for (DateTimeFormatter f : formats) {
                try {
                    return LocalDate.parse(v.trim(), f);
                } catch (Exception ignored) {}
            }

            return null;

        } catch (Exception e) {
            return null;
        }
    }

    private Timestamp parseTimestamp(String v) {
        try {
            if (v == null || v.isBlank()) return null;

            if (v.matches("\\d+(\\.\\d+)?")) {
                double excelDate = Double.parseDouble(v);
                LocalDate date = LocalDate.of(1899, 12, 30).plusDays((long) excelDate);
                return Timestamp.valueOf(date.atStartOfDay());
            }

            return Timestamp.valueOf(v.trim());

        } catch (Exception e) {
            return null;
        }
    }
}

