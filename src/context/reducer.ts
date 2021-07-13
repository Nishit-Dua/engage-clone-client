import { StateType } from "./AppProvider";

type DispatchType = {
  type: Actions;
  payload?: any;
};

type Actions =
  | "MIC-TOGGLE"
  | "VIDEO-TOGGLE"
  | "DECONNECT-FROM-VIDEO"
  | "DISCONNECTED"
  | "GO-TO-CHAT-ROOM";

export interface ReturnType extends StateType {
  dispatchApp: React.Dispatch<DispatchType>;
}

export const reducer = (state: StateType, action: DispatchType): StateType => {
  switch (action.type) {
    case "MIC-TOGGLE":
      return { ...state, isMicOn: !state.isMicOn };
    case "VIDEO-TOGGLE":
      return { ...state, isVideoOn: !state.isVideoOn };
    case "DECONNECT-FROM-VIDEO":
      return { ...state, leaveVideoChatTrigger: true };
    case "DISCONNECTED":
      return { ...state, leaveVideoChatTrigger: false, chatRoomTrigger: false };
    case "GO-TO-CHAT-ROOM":
      return { ...state, leaveVideoChatTrigger: true, chatRoomTrigger: true };
    default:
      return state;
  }
};
