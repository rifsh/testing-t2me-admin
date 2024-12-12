export const ActionType = {
    WARNING: "warning",
    SUBMIT: "submit",
  };
  
 export const handleAction = (action) => {
    switch (action) {
      case ActionType.WARNING:
        return ActionType.WARNING;
      case ActionType.SUBMIT:
        return ActionType.SUBMIT;
      default:
        return "Invalid action";
    }
  };
