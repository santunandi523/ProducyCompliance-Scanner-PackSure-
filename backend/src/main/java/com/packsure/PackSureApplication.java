package com.packsure;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class PackSureApplication {
    public static void main(String[] args) {
        SpringApplication.run(PackSureApplication.class, args);
    }
}
