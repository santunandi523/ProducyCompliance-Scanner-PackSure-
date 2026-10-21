package com.packsure.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.io.File;
import java.util.List;

@Service
public class AiClientService {

    @Value("${packsure.ai.service.url}")
    private String aiServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public JsonNode analyzeImages(List<String> imagePaths) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            for (String p : imagePaths) {
                File file = new File(p);
                if (file.exists()) {
                    body.add("files", new FileSystemResource(file));
                }
            }

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            String url = aiServiceUrl + "/api/v1/analyze";

            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, requestEntity, String.class);
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                return objectMapper.readTree(response.getBody());
            } else {
                throw new RuntimeException("Document analysis service returned status: " + response.getStatusCode());
            }
        } catch (ResourceAccessException e) {
            throw new RuntimeException("Document analysis service is currently unavailable. Please retry.");
        } catch (Exception e) {
            throw new RuntimeException("Document analysis service error: " + e.getMessage(), e);
        }
    }
}
