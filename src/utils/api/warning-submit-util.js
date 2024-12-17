export const ActionType = {
    WARNING: "warning",
    SUBMIT: "submit",
    CONFIRM:"confirm"
  };
  
 export const handleAction = (action) => {
    switch (action) {
      case ActionType.WARNING:
        return ActionType.WARNING;
      case ActionType.SUBMIT:
        return ActionType.SUBMIT;
      case ActionType.CONFIRM:
        return ActionType.CONFIRM;
      default:
        return "Invalid action";
    }
  };
