package com.pmo.demo.domain;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class HeaderUpdateRequest {

    private String entityName;   
    private String recordId;  
    private String headerName; 
    private String value;
}

