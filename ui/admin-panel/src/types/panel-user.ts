export type PageResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type PanelUserStatus = "ACTIVE" | "INACTIVE";

export type PanelUserSearchParams = {
  username?: string;
  name?: string;
  status?: PanelUserStatus | "";
  organization?: string;
  page?: number;
  size?: number;
};

export type PanelUserItem = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  status: string;
  organizationId: string;
  organizationCode: string;
  organizationName: string;
  lastLoginAt: string | null;
  createdAt: string;
};

export type PanelUserSearchResponse = PageResponse<PanelUserItem>;

export type OrganizationSummary = {
  id: string;
  code: string;
  name: string;
  nationalId?: string | null;
  status: string;
  email?: string | null;
  phone?: string | null;
};

export type CreatePanelUserRequest = {
  organizationId: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  status?: PanelUserStatus;
};

export type UpdatePanelUserStatusRequest = {
  status: PanelUserStatus;
};
