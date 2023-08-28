import { PORT_ATTRIBUTES, ROLE } from "@Constant/Common";
import { Document, Schema } from "mongoose";

type TUserRole = (typeof ROLE)[keyof typeof ROLE];

export interface INetworkStatusDetail {
  code: number;
  message: string;
  description: string;
  alternateDescription: string;
}

export interface INetworkStatus {
  unset: INetworkStatusDetail;
  reset: INetworkStatusDetail;
  pendingToStart: INetworkStatusDetail;
  pendingToStop: INetworkStatusDetail;
  started: INetworkStatusDetail;
  failedToStart: INetworkStatusDetail;
  stopped: INetworkStatusDetail;
  failedToStop: INetworkStatusDetail;
}

export interface IDockerPortsModel extends Document {
  [PORT_ATTRIBUTES.p0Port]: number;
  [PORT_ATTRIBUTES.caPort]: number;
  [PORT_ATTRIBUTES.couchPort]: number;
  [PORT_ATTRIBUTES.reserved]: boolean;
}

export interface INetwork extends Document {
  netId: string;
  name: string;
  address: string;
  associatedOrganizations: Schema.Types.ObjectId[];
  status: INetworkStatusDetail;
}

export interface IOrganization extends Document {
  fullName: string;
  nameId: string;
  adminUserId: string;
  adminPassword: string;
  country: string;
  state: string;
  city: string;
  p0Port: number;
  caPort: number;
  couchPort: number;
  enrolled: boolean;
}

export interface IUser extends Document {
  userId: string;
  password: string;
  type: TUserRole;
  associatedOrganization: Schema.Types.ObjectId | null;
  isAlternatePassword: boolean;
  refreshToken: string | null;
  comparePassword(sentUserId: string, sentPassword: string): Promise<boolean>;
  compareType(sentPassword: string, sentType: string): Promise<boolean>;
}
