package com.pmo.demo.common;

import org.springframework.stereotype.Component;
import java.lang.reflect.Field;

@Component
public class BeanMapper {

    public <T> T copy(Object src, T target) {
        for (Field f : src.getClass().getDeclaredFields()) {
            try {
                f.setAccessible(true);
                Object v = f.get(src);

                Field targetField = null;
                try {
                    targetField = target.getClass().getDeclaredField(f.getName());
                } catch (NoSuchFieldException ignored) {}

                if (targetField != null) {
                    targetField.setAccessible(true);
                    targetField.set(target, v);
                }

            } catch (Exception ignored) {}
        }
        return target;
    }
}

