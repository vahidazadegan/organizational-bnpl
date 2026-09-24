package com.organizational.bnpl.admin.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.organizational.bnpl.admin.domain.AdminUser;
import com.organizational.bnpl.admin.repository.AdminUserRepository;
import com.organizational.bnpl.admin.security.AdminUserPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private AdminUserRepository adminUserRepository;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@BeforeEach
	void setUp() {
		adminUserRepository.deleteAll();

		AdminUser user = new AdminUser();
		user.setUsername("platform.admin");
		user.setPasswordHash(passwordEncoder.encode("Secret123!"));
		user.setFirstName("Platform");
		user.setLastName("Admin");
		user.setStatus(AdminUserPrincipal.STATUS_ACTIVE);
		adminUserRepository.save(user);
	}

	@Test
	void loginReturnsAccessToken() throws Exception {
		mockMvc.perform(post("/api/auth/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"username":"platform.admin","password":"Secret123!"}
								"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.accessToken").isNotEmpty())
				.andExpect(jsonPath("$.tokenType").value("Bearer"))
				.andExpect(jsonPath("$.user.username").value("platform.admin"));
	}

	@Test
	void loginWithWrongPasswordReturnsUnauthorized() throws Exception {
		mockMvc.perform(post("/api/auth/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"username":"platform.admin","password":"wrong"}
								"""))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void meRequiresAuthentication() throws Exception {
		mockMvc.perform(get("/api/me"))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void meReturnsClaimsWithValidToken() throws Exception {
		MvcResult login = mockMvc.perform(post("/api/auth/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"username":"platform.admin","password":"Secret123!"}
								"""))
				.andExpect(status().isOk())
				.andReturn();

		String body = login.getResponse().getContentAsString();
		String token = body.replaceAll("(?s).*\"accessToken\"\\s*:\\s*\"([^\"]+)\".*", "$1");

		mockMvc.perform(get("/api/me")
						.header("Authorization", "Bearer " + token))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.subject").value("platform.admin"));
	}
}
