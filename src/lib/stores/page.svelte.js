export const page = $state({
    current: "login"
});

export const navigateTo = (otherPage) => {
    page.current = otherPage
}