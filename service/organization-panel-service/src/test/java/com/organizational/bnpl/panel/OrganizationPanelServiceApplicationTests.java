package com.organizational.bnpl.panel;

import com.organizational.bnpl.panel.config.TestJwtDecoderConfig;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
@Import(TestJwtDecoderConfig.class)
class OrganizationPanelServiceApplicationTests {

	@Test
	void contextLoads() {
	}

}
