export type CustomerUser = {
  id: string;
  mobile: string;
};

export type LoginResponse = {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: CustomerUser;
};

export type OtpRequestPayload = {
  mobile: string;
};

export type OtpRequestResponse = {
  mobile: string;
  expiresInSeconds: number;
};

export type OtpVerifyPayload = {
  mobile: string;
  code: string;
};
