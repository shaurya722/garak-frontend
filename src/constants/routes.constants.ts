// Application routes

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  
  // Detectors
  DETECTORS: "/detectors",
  DETECTORS_NEW: "/detectors/new",
  DETECTORS_TEST: "/detectors/test",
  DETECTOR_VIEW: (id: string) => `/detectors/${id}`,
  DETECTOR_EDIT: (id: string) => `/detectors/${id}/edit`,
  
  // Other
  GETTING_STARTED: "/getting-start",
} as const;

export const PUBLIC_ROUTES = [
  ROUTES.LOGIN,
  ROUTES.SIGNUP,
] as const;

export const AUTH_REDIRECT_KEY = "next";
