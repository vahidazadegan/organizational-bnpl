export type OrganizationItem = {
  id: string;
  code: string;
  name: string;
  nationalId: string | null;
  status: string;
  email: string | null;
  phone: string | null;
};

export type OrganizationStatus = "ACTIVE" | "INACTIVE";

export type CreateOrganizationRequest = {
  code: string;
  name: string;
  nationalId?: string | null;
  email?: string | null;
  phone?: string | null;
  status?: OrganizationStatus;
};

export type UpdateOrganizationStatusRequest = {
  status: OrganizationStatus;
};
