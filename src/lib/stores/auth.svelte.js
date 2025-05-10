export const authState = $state({
    isLoggedIn: false,
    user: null,
});

export const login = (userData) => {
    authState.isLoggedIn = true;
    authState.user = userData;
}

export const logout = () => {
    authState.isLoggedIn = false;
    authState.user = null;
}