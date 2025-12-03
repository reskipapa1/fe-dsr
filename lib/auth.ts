export type UserInfo = {
nik: string;
nama: string;
email: string;
role: string;
};

const TOKEN_KEY = "dsr_token";
const USER_KEY = "dsr_user";

export function saveAuth(token: string, user: UserInfo) {
if (typeof window === "undefined") return;
localStorage.setItem(TOKEN_KEY, token);
localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getAuth() {
if (typeof window === "undefined") return { token: null, user: null };
const token = localStorage.getItem(TOKEN_KEY);
const userStr = localStorage.getItem(USER_KEY);
const user = userStr ? (JSON.parse(userStr) as UserInfo) : null;
return { token, user };
}

export function clearAuth() {
if (typeof window === "undefined") return;
localStorage.removeItem(TOKEN_KEY);
localStorage.removeItem(USER_KEY);
}

