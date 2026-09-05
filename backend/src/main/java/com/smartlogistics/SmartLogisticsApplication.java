package com.smartlogistics;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class SmartLogisticsApplication {

    public static void main(String[] args) {
        SpringApplication.run(SmartLogisticsApplication.class, args);
    }
}
