package com.organizational.bnpl.panel.repository;

import com.organizational.bnpl.panel.domain.DataEntryFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface DataEntryFileRepository
		extends JpaRepository<DataEntryFile, UUID>, JpaSpecificationExecutor<DataEntryFile> {

	@Query("""
			select f from DataEntryFile f
			join fetch f.uploadedBy
			where f.id = :id and f.organization.id = :organizationId
			""")
	Optional<DataEntryFile> findByIdAndOrganizationIdWithUploader(
			@Param("id") UUID id,
			@Param("organizationId") UUID organizationId);
}
