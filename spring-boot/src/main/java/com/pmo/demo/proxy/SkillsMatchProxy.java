package com.pmo.demo.proxy;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

@Component
public class SkillsMatchProxy {
	
	@Autowired
	private RestTemplate restTemplate;

    public ResponseEntity<String> proxyMatchSkills(String autoReqId) {

        String pythonUrl = "http://localhost:8000/match-skills/";

        // Headers
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        headers.setAccept(List.of(MediaType.ALL));

        // Body
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("autoReqId", autoReqId);

        HttpEntity<MultiValueMap<String, Object>> requestEntity =
                new HttpEntity<>(body, headers);

        return restTemplate.exchange(
                pythonUrl,
                HttpMethod.POST,
                requestEntity,
                String.class
        );
    }	
}
