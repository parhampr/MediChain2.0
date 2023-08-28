import { GET_ATTRIBUTES } from "@Constant/Common";
import { INetwork, IOrganization } from "./models";

export type TGetAttributes = (typeof GET_ATTRIBUTES)[keyof typeof GET_ATTRIBUTES];

export interface INetAndOrg {
  netId?: string;
  orgId?: string;
}

export type TNetAndOrgReturnType = {
  foundNetwork?: INetwork;
  isNetworkRunning?: boolean;
  organization?: IOrganization;
};
