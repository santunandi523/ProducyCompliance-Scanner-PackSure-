package com.packsure.controller;

import com.packsure.dto.ApiResponse;
import com.packsure.model.ProductCategory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/product-categories")
public class ProductCategoryController {

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductCategory.CategoryDto>>> getCategories() {
        return ResponseEntity.ok(ApiResponse.ok(ProductCategory.getAllCategoriesDto(), "Product categories retrieved successfully"));
    }
}
