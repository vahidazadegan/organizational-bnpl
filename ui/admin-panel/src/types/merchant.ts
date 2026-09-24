export type MerchantItem = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  accessId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type MerchantStatus = "ACTIVE" | "INACTIVE";

export type CreateMerchantRequest = {
  name: string;
  phone?: string | null;
  email?: string | null;
  status?: MerchantStatus;
};

export type UpdateMerchantRequest = {
  name?: string;
  phone?: string | null;
  email?: string | null;
};

export type UpdateMerchantStatusRequest = {
  status: MerchantStatus;
};

export type MerchantCreatedResponse = MerchantItem & {
  accessKey: string;
};

export type MerchantAccessKeyResponse = {
  id: string;
  accessId: string;
  accessKey: string;
};
