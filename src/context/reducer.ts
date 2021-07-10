import { StateType } from "./AppProvider";

type DispatchType = {
  type: Actions;
  payload?: any;
};

// Add Dispatch "type" Actions Here To add type support (and use in TS)
type Actions = "MIC-TOGGLE" | "VIDEO-TOGGLE";

export interface ReturnType extends StateType {
  dispatchApp: React.Dispatch<DispatchType>;
}

export const reducer = (state: StateType, action: DispatchType): StateType => {
  switch (action.type) {
    case "MIC-TOGGLE":
      return { ...state, isMicOn: !state.isMicOn };
    case "VIDEO-TOGGLE":
      return { ...state, isVideoOn: !state.isVideoOn };
    default:
      return state;
  }
};
