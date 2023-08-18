import { createEntityAdapter, createSlice, nanoid } from "@reduxjs/toolkit";
import { INFO, MAX_TIME } from "../../common/constants/notification";

const notificationAdapter = createEntityAdapter();

const notificationSlice = createSlice({
  name: "notifications",
  initialState: notificationAdapter.getInitialState(),
  reducers: {
    setNotification: {
      reducer(state, { payload }) {
        notificationAdapter.addOne(state, payload);
      },
      prepare(title, description, type = INFO, maxTimer = MAX_TIME) {
        return {
          payload: {
            id: nanoid(),
            title,
            description,
            type,
            maxTimer,
            date: new Date().toISOString(),
          },
        };
      },
    },
    destroyNotification: (state, { payload }) => {
      notificationAdapter.removeOne(state, payload);
    },
  },
});

export const { setNotification, destroyNotification } = notificationSlice.actions;
export const { selectAll: selectAllNotifications } = notificationAdapter.getSelectors((state) => state.notifications);

export default notificationSlice.reducer;
