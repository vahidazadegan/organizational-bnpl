package com.organizational.bnpl.panel.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

	public static final String BEARER_JWT = "bearer-jwt";

	@Bean
	OpenAPI organizationPanelOpenApi() {
		return new OpenAPI()
				.info(new Info()
						.title("Organization Panel API")
						.description("Organizational BNPL panel backend")
						.version("v1"))
				.addSecurityItem(new SecurityRequirement().addList(BEARER_JWT))
				.components(new Components()
						.addSecuritySchemes(BEARER_JWT, new SecurityScheme()
								.name(BEARER_JWT)
								.type(SecurityScheme.Type.HTTP)
								.scheme("bearer")
								.bearerFormat("JWT")));
	}
}
