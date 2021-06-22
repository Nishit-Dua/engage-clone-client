import { StateType } from "./AppProvider";

type DispatchType = {
  type: Actions;
  payload?: any;
};

// Add Dispatch "type" Actions Here To add type support (and use in TS)
type Actions = "ADD" | "FETCH" | "DELETE";

export interface ReturnType extends StateType {
  dispatch: React.Dispatch<DispatchType>;
}

export const reducer = (state: StateType, action: DispatchType): StateType => {
  switch (action.type) {
    case "ADD":
      return { ...state };
    case "FETCH":
      return { ...state };
    case "DELETE":
      return { ...state };

    default:
      return state;
  }
};
