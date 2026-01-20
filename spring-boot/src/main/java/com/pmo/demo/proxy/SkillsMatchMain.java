package com.pmo.demo.proxy;

import org.springframework.http.ResponseEntity;

public class SkillsMatchMain {
	
	public static void main(String[] args) {
		SkillsMatchProxy proxy = new SkillsMatchProxy();

		String autoReqId = "37835BR";
		ResponseEntity<String> response = proxy.proxyMatchSkills(autoReqId);

	    System.out.println("Response from Python service:");
	    System.out.println(response.getBody());

	}
}
