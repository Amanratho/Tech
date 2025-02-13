import { createSlice } from '@reduxjs/toolkit';

const elementSlice = createSlice({
  name: 'element',
  initialState: { isVisible: false },
  reducers: {
    setVisibility: (state, action) => {
      state.isVisible = action.payload;
    },
  },
});

export const { showElement } = elementSlice.actions;
export default elementSlice.reducer;
