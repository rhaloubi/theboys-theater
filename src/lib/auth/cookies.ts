export const SESSION_COOKIE = "tbt_session";
export const PROFILE_COOKIE = "tbt_profile";

const SESSION_TTL_SEC = 30 * 24 * 60 * 60;

const baseCookie = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export function sessionCookieOptions(token: string) {
  return {
    ...baseCookie,
    name: SESSION_COOKIE,
    value: token,
    maxAge: SESSION_TTL_SEC,
  };
}

export function clearSessionCookieOptions() {
  return {
    ...baseCookie,
    name: SESSION_COOKIE,
    value: "",
    maxAge: 0,
  };
}

export function profileCookieOptions(slug: string) {
  return {
    ...baseCookie,
    name: PROFILE_COOKIE,
    value: slug,
    maxAge: SESSION_TTL_SEC,
  };
}

export function clearProfileCookieOptions() {
  return {
    ...baseCookie,
    name: PROFILE_COOKIE,
    value: "",
    maxAge: 0,
  };
}
