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
        "app.seed.enabled=false"
})
class InsuranceApplicationTests {

    @Test
    void contextLoads() {
    }
}