package com.organizational.bnpl.merchant;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EntityScan(basePackages = {
		"com.organizational.bnpl.admin.domain",
		"com.organizational.bnpl.panel.domain"
})
@EnableJpaRepositories(basePackages = "com.organizational.bnpl.merchant.repository")
public class MerchantServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(MerchantServiceApplication.class, args);
	}

}
