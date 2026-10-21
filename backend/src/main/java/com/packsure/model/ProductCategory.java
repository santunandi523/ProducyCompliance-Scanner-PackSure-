package com.packsure.model;

import java.util.ArrayList;
import java.util.List;

public enum ProductCategory {
    FOOD("Food & Beverages", "Packaged foods, snacks, beverages, dairy, groceries"),
    ELECTRONICS("Electronics & Electricals", "Electronic devices, appliances, chargers, batteries, cables"),
    COSMETICS("Cosmetics & Beauty", "Skincare, makeup, sunscreens, hair color, perfumes"),
    PERSONAL_CARE("Personal Care & Hygiene", "Soaps, shampoo, toothpaste, deodorants, hand sanitizers"),
    HOUSEHOLD("Household & Cleaning", "Detergents, surface cleaners, disinfectants, mosquito repellents"),
    TEXTILES("Textiles & Apparel", "Clothing, fabrics, towels, bedsheets, wash care items"),
    MEDICINES_HEALTHCARE("Medicines & Healthcare", "Pharmaceuticals, OTC drugs, health supplements, medical devices, nasal sprays"),
    OTHER("Other Commodity", "General packaged commodities not falling under specific categories");

    private final String displayName;
    private final String description;

    ProductCategory(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public String getDisplayName() { return displayName; }
    public String getDescription() { return description; }

    public static boolean isValid(String categoryStr) {
        if (categoryStr == null || categoryStr.trim().isEmpty()) return false;
        for (ProductCategory pc : values()) {
            if (pc.name().equalsIgnoreCase(categoryStr.trim()) || pc.getDisplayName().equalsIgnoreCase(categoryStr.trim())) {
                return true;
            }
        }
        return false;
    }

    public static ProductCategory fromString(String categoryStr) {
        if (categoryStr == null || categoryStr.trim().isEmpty()) return OTHER;
        for (ProductCategory pc : values()) {
            if (pc.name().equalsIgnoreCase(categoryStr.trim()) || pc.getDisplayName().equalsIgnoreCase(categoryStr.trim())) {
                return pc;
            }
        }
        return OTHER;
    }

    public static List<CategoryDto> getAllCategoriesDto() {
        List<CategoryDto> dtos = new ArrayList<>();
        for (ProductCategory pc : values()) {
            dtos.add(new CategoryDto(pc.name(), pc.getDisplayName(), pc.getDescription()));
        }
        return dtos;
    }

    public static class CategoryDto {
        private String code;
        private String displayName;
        private String description;

        public CategoryDto(String code, String displayName, String description) {
            this.code = code;
            this.displayName = displayName;
            this.description = description;
        }

        public String getCode() { return code; }
        public String getDisplayName() { return displayName; }
        public String getDescription() { return description; }
    }
}
