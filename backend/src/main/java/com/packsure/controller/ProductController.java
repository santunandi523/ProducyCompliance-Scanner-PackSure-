package com.packsure.controller;

import com.packsure.dto.ApiResponse;
import com.packsure.model.Declaration;
import com.packsure.model.Inspection;
import com.packsure.model.Product;
import com.packsure.repository.DeclarationRepository;
import com.packsure.repository.InspectionRepository;
import com.packsure.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private InspectionRepository inspectionRepository;

    @Autowired
    private DeclarationRepository declarationRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Product>>> getAllProducts(
            @RequestParam(required = false) String search) {
        List<Product> list = (search != null && !search.trim().isEmpty())
                ? productRepository.findByNameContainingIgnoreCaseOrBrandContainingIgnoreCase(search, search)
                : productRepository.findAll();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Product>> getProductById(@PathVariable Long id) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        return ResponseEntity.ok(ApiResponse.ok(p));
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getProductHistory(@PathVariable Long id) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));

        List<Inspection> inspections = inspectionRepository.findByProductIdOrderByCreatedAtDesc(id);

        List<Map<String, Object>> timeline = new ArrayList<>();
        for (Inspection ins : inspections) {
            List<Declaration> decls = declarationRepository.findByInspectionId(ins.getId());
            Map<String, Object> entry = new HashMap<>();
            entry.put("inspectionId", ins.getId());
            entry.put("inspectionNumber", ins.getInspectionNumber());
            entry.put("date", ins.getCreatedAt());
            entry.put("status", ins.getFinalStatus());
            entry.put("score", ins.getScreeningScore());
            entry.put("declarations", decls);
            timeline.add(entry);
        }

        Map<String, Object> data = Map.of(
                "product", p,
                "inspectionsCount", inspections.size(),
                "latestStatus", !inspections.isEmpty() ? inspections.get(0).getFinalStatus() : "NONE",
                "timeline", timeline
        );

        return ResponseEntity.ok(ApiResponse.ok(data));
    }
}
