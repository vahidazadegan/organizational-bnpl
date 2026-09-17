package com.organizational.bnpl.panel.security;

import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Getter
public class PanelUserPrincipal implements UserDetails {

	public static final String STATUS_ACTIVE = "ACTIVE";

	private final UUID id;
	private final UUID organizationId;
	private final String username;
	private final String password;
	private final String firstName;
	private final String lastName;
	private final String status;

	public PanelUserPrincipal(
			UUID id,
			UUID organizationId,
			String username,
			String password,
			String firstName,
			String lastName,
			String status) {
		this.id = id;
		this.organizationId = organizationId;
		this.username = username;
		this.password = password;
		this.firstName = firstName;
		this.lastName = lastName;
		this.status = status;
	}

	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		return List.of(new SimpleGrantedAuthority("ROLE_PANEL_USER"));
	}

	@Override
	public boolean isAccountNonExpired() {
		return true;
	}

	@Override
	public boolean isAccountNonLocked() {
		return true;
	}

	@Override
	public boolean isCredentialsNonExpired() {
		return true;
	}

	@Override
	public boolean isEnabled() {
		return STATUS_ACTIVE.equalsIgnoreCase(status);
	}
}
