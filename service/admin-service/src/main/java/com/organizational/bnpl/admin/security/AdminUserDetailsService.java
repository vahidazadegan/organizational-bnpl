package com.organizational.bnpl.admin.security;

import com.organizational.bnpl.admin.repository.AdminUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminUserDetailsService implements UserDetailsService {

	private final AdminUserRepository adminUserRepository;

	@Override
	@Transactional(readOnly = true)
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		return adminUserRepository.findByUsername(username)
				.map(user -> new AdminUserPrincipal(
						user.getId(),
						user.getUsername(),
						user.getPasswordHash(),
						user.getFirstName(),
						user.getLastName(),
						user.getStatus()))
				.orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
	}
}
