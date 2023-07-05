import { createSelector } from "@reduxjs/toolkit";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
  // keepUnusedDataFor: 5,  // * untuk waktu simpan data (cahced), lebih dari 5 detik akan nge fetch ulang saat halaman dibuka
  tagTypes: ["Services", "Dogs"],
  refetchOnFocus: true,
  refetchOnReconnect: true,
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
    headers: { "x-custom-header": Math.random() },
  }),
  endpoints: (builder) => ({
    getServices: builder.query({
      query: () => ({
        url: "/services",
        headers: { "x-custom-header": Math.random() },
      }),
    }),

    getService: builder.query({ query: (id) => `/services/${id}` }),

    makeContact: builder.mutation({
      query: (body) => ({
        url: "contact", // * /api/contact
        method: "POST",
        body,
      }),
    }),
    getDogs: builder.query({
      query: () => "/dogs",
      transformResponse: (dogs) => {
        const allDogs = {};
        for (const id in dogs) {
          const dog = dogs[id];
          allDogs[id] = {
            ...dog,
            size: getSize(dog.weight),
            age: getAge(dog.dob),
          };
        }
        return allDogs;
      },
      providesTags: ["Dogs"], // * OK, simpan di cache
    }),
    addDog: builder.mutation({
      query: (body) => ({
        url: "/dogs", // * /api/dog
        method: "POST",
        body,
      }),
      invalidatesTags: ["Dogs"], // * Refetch & update cache nya
    }),
    removeDog: builder.mutation({
      query: (id) => ({
        url: `/dogs/${id}`, // * /api/dog/2
        method: "DELETE",
      }),
      invalidatesTags: ["Dogs"], // * Refetch & update cache nya
      onQueryStarted(id, { dispatch, queryFulfilled }) {
        // * Optimistic updates
        const update = dispatch(
          api.util.updateQueryData("getDogs", undefined, (dogs) => {
            delete dogs[id];
          })
        );

        // * Failed Optimistic updates, undo the change
        queryFulfilled.catch(() => update.undo);
      },
    }),
  }),
});

export const {
  useGetServicesQuery,
  useGetServiceQuery,
  useGetDogsQuery,

  useMakeContactMutation,
  useAddDogMutation,
  useRemoveDogMutation,
} = api;

export const getServicesForLuckyDog = createSelector(
  api.endpoints.getServices.select(), // * executed query
  api.endpoints.getDogs.select(), // * executed query
  (state) => state.dogs.luckyDog,
  ({ data: services }, { data: myDogs }, luckyDog) => {
    // if you don't have a lucky dog, show all of the services
    const dog = myDogs?.[luckyDog];
    if (!dog) {
      return services;
    }

    // filter the services shown based on the currently chosen dog
    return services
      .filter(({ restrictions }) => {
        return restrictions.minAge ? dog.age >= restrictions.minAge : true;
      })
      .filter(({ restrictions }) => {
        return restrictions.breed
          ? restrictions.breed.includes(dog.breed)
          : true;
      })
      .filter(({ restrictions }) => {
        return restrictions.breed ? restrictions.size.includes(dog.size) : true;
      });
  }
);

// utilities
export function getSize(weight) {
  weight = parseInt(weight, 10);
  if (weight <= 10) return "teacup";
  if (weight <= 25) return "small";
  if (weight <= 50) return "medium";
  if (weight <= 80) return "large";
  if (weight <= 125) return "x-large";
  return "jumbo";
}

const YEAR = 3.156e10;
export function getAge(dob) {
  const date = +new Date(dob);
  return Math.floor((Date.now() - date) / YEAR);
}
