import { createSelector } from "@reduxjs/toolkit";
import { api } from "../../store/apiSlice";

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

export const getServiceById = (state, serviceId) => {
  return state.services.services.find((service) => service.id === serviceId);
};
