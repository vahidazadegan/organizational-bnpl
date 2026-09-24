package com.organizational.bnpl.panel.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.organizational.bnpl.panel.domain.identity.Organization;
import com.organizational.bnpl.panel.domain.identity.PanelUser;
import com.organizational.bnpl.panel.repository.OrganizationRepository;
import com.organizational.bnpl.panel.repository.PanelUserRepository;
import com.organizational.bnpl.panel.security.PanelUserPrincipal;
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
	private OrganizationRepository organizationRepository;

	@Autowired
	private PanelUserRepository panelUserRepository;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@BeforeEach
	void setUp() {
		panelUserRepository.deleteAll();
		organizationRepository.deleteAll();

		Organization organization = new Organization();
		organization.setCode("ORG-1");
		organization.setName("Test Org");
		organization.setStatus("ACTIVE");
		organization = organizationRepository.save(organization);

		PanelUser user = new PanelUser();
		user.setOrganization(organization);
		user.setUsername("panel.admin");
		user.setPasswordHash(passwordEncoder.encode("Secret123!"));
		user.setFirstName("Panel");
		user.setLastName("Admin");
		user.setStatus(PanelUserPrincipal.STATUS_ACTIVE);
		panelUserRepository.save(user);
	}

	@Test
	void loginReturnsAccessToken() throws Exception {
		mockMvc.perform(post("/api/auth/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"username":"panel.admin","password":"Secret123!"}
								"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.accessToken").isNotEmpty())
				.andExpect(jsonPath("$.tokenType").value("Bearer"))
				.andExpect(jsonPath("$.user.username").value("panel.admin"));
	}

	@Test
	void loginWithWrongPasswordReturnsUnauthorized() throws Exception {
		mockMvc.perform(post("/api/auth/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"username":"panel.admin","password":"wrong"}
								"""))
				.andExpect(status().isUnauthorized())
				.andExpect(jsonPath("$.message").value("نام کاربری یا رمز ورود اشتباه وارد شده است"));
	}

	@Test
	void accessTokenCanCallProtectedEndpoint() throws Exception {
		MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{"username":"panel.admin","password":"Secret123!"}
								"""))
				.andExpect(status().isOk())
				.andReturn();

		String body = loginResult.getResponse().getContentAsString();
		String token = body.replaceAll("(?s).*\"accessToken\"\\s*:\\s*\"([^\"]+)\".*", "$1");

		mockMvc.perform(get("/api/me").header("Authorization", "Bearer " + token))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.subject").value("panel.admin"));
	}
}
