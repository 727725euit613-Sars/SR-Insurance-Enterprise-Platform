package com.insurance;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(classes = InsuranceApplication.class, properties = {
        "spring.datasource.url=jdbc:h2:mem:insurance_test",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.flyway.enabled=false",
        "app.seed.enabled=false",
        "app.jwt.secret=test-secret-that-is-at-least-32-characters-long",
        "app.jwt.expiration-ms=3600000"
})
class InsuranceApplicationTests {

    @Test
    void contextLoads() {
    }
}