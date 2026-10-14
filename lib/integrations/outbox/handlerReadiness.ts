export type HandlerReadiness =
  | { ready: true }
  | {
      ready: false;
      reason: "NOT_IMPLEMENTED" | "DEPENDENCY_UNAVAILABLE";
    };
