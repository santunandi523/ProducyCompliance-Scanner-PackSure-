package com.packsure.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {

    @GetMapping(value = {
        "/",
        "/login",
        "/dashboard",
        "/scan",
        "/inspection/{id}",
        "/inspections/{id}",
        "/products",
        "/products/{id}",
        "/violations",
        "/reports",
        "/history",
        "/rules",
        "/audit",
        "/users",
        "/profile"
    })
    public String forwardClientRoutes() {
        return "forward:/index.html";
    }
}
