package com.pmo.demo.entity;

import java.io.Serializable;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BrEmployeeMatch implements Serializable {
	
	private static final long serialVersionUID = 1L;

	private String autoReqId;
	private String empNo;
	private String skillName;
}
