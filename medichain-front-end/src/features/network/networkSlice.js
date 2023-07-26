import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { apiSlice } from "../../app/api/apiSlice";
const networkAdapter = createEntityAdapter({
  selectId: (network) => network._id,
});

const organizationAdapter = createEntityAdapter({
  selectId: (organization) => organization._id,
});

const networkSlice = createSlice({
  name: "network",
  initialState: networkAdapter.getInitialState({
    organizations: organizationAdapter.getInitialState(),
  }),
  reducers: {},

  extraReducers: (builder) => {
    builder
      .addMatcher(apiSlice.endpoints.fetchNetwork.matchFulfilled, (state, { payload }) => {
        const networks = payload.map(({ associatedOrganizations, ...rest }) => ({
          ...rest,
          associatedOrgID: associatedOrganizations.map((org) => org._id),
        }));
        const organizations = payload.reduce((prev, curr) => [...prev, curr.associatedOrganizations], []).flat();
        networkAdapter.setAll(state, networks);
        organizationAdapter.setAll(state.organizations, organizations);
      })
      .addMatcher(apiSlice.endpoints.fetchSingleNetwork.matchFulfilled, (state, { payload }) => {
        const { associatedOrganizations, ...network } = payload;
        network.associatedOrgID = associatedOrganizations.map((org) => org._id);
        networkAdapter.upsertOne(state, network);
        organizationAdapter.upsertMany(state.organizations, associatedOrganizations);
      });
  },
});

export const { selectAll: selectAllNetworks, selectById: selectNetworkById } = networkAdapter.getSelectors(
  (state) => state.network
);

export const { selectAll: selectAllOrganizations } = networkAdapter.getSelectors(
  (state) => state.network.organizations
);

export default networkSlice.reducer;
