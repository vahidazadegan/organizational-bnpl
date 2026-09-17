package com.organizational.bnpl.panel.security;

import com.organizational.bnpl.panel.repository.PanelUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PanelUserDetailsService implements UserDetailsService {

	private final PanelUserRepository panelUserRepository;

	@Override
	@Transactional(readOnly = true)
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		return panelUserRepository.findByUsernameWithOrganization(username)
				.map(user -> new PanelUserPrincipal(
						user.getId(),
						user.getOrganization().getId(),
						user.getUsername(),
						user.getPasswordHash(),
						user.getFirstName(),
						user.getLastName(),
						user.getStatus()))
				.orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
	}
}
