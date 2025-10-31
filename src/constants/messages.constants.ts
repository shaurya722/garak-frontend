// User-facing messages

export const ERROR_MESSAGES = {
  GENERIC: "Something went wrong. Please try again.",
  NETWORK: "Network error. Please check your connection.",
  UNAUTHORIZED: "You are not authorized to perform this action.",
  NOT_FOUND: "The requested resource was not found.",
  VALIDATION: "Please check your input and try again.",
  
  // Auth
  LOGIN_FAILED: "Login failed. Please check your credentials.",
  TOKEN_EXPIRED: "Your session has expired. Please login again.",
  
  // Detectors
  DETECTOR_LOAD_FAILED: "Failed to load detectors.",
  DETECTOR_CREATE_FAILED: "Failed to create detector.",
  DETECTOR_UPDATE_FAILED: "Failed to update detector.",
  DETECTOR_DELETE_FAILED: "Failed to delete detector.",
  DETECTOR_NOT_FOUND: "Detector not found.",
} as const;

export const SUCCESS_MESSAGES = {
  // Auth
  LOGIN_SUCCESS: "Login successful!",
  LOGOUT_SUCCESS: "Logged out successfully.",
  
  // Detectors
  DETECTOR_CREATED: "Detector created successfully!",
  DETECTOR_UPDATED: "Detector updated successfully!",
  DETECTOR_DELETED: "Detector deleted successfully!",
} as const;

export const LOADING_MESSAGES = {
  GENERIC: "Loading...",
  AUTHENTICATING: "Authenticating...",
  SAVING: "Saving...",
  DELETING: "Deleting...",
  LOADING_DETECTORS: "Loading detectors...",
} as const;
