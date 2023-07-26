import { apiSlice } from "../../app/api/apiSlice";

export const networkApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    fetchNetwork: builder.query({
      query: () => ({ url: "/network/fetch" }),
    }),

    fetchSingleNetwork: builder.query({
      query: (id) => ({ url: `/network/fetch?id=${id}` }),
    }),

    fetchNetworkStatus: builder.query({
      query: (id) => ({ url: `/network/fetch?id=${id}&filter=status` }),
    }),

    createNetwork: builder.mutation({
      query: (data) => ({
        url: "/network/create_network",
        method: "POST",
        body: { ...data },
      }),
    }),

    createOrganization: builder.mutation({
      query: (data) => ({
        url: "/network/create_organization",
        method: "POST",
        body: { ...data },
      }),
    }),

    enrollOrganization: builder.mutation({
      query: ({ netId, orgId }) => ({
        url: `/network/enroll_organization/${netId}/${orgId}`,
        method: "POST",
      }),
    }),

    deleteOrganization: builder.mutation({
      query: ({ netId, orgId }) => ({
        url: `/network/delete_organization/${netId}/${orgId}`,
        method: "DELETE",
      }),
    }),

    startNetwork: builder.mutation({
      query: (data) => ({
        url: "/network/hlf/start",
        method: "POST",
        body: { ...data },
      }),
    }),

    stopNetwork: builder.mutation({
      query: (data) => ({
        url: "/network/hlf/stop",
        method: "POST",
        body: { ...data },
      }),
    }),
  }),
});

export const {
  useFetchNetworkQuery,
  useFetchSingleNetworkQuery,
  useLazyFetchSingleNetworkQuery,
  useFetchNetworkStatusQuery,
  useLazyFetchNetworkStatusQuery,
  useCreateNetworkMutation,
  useCreateOrganizationMutation,
  useEnrollOrganizationMutation,
  useDeleteOrganizationMutation,
  useStartNetworkMutation,
  useStopNetworkMutation,
} = networkApiSlice;
