// errorUtils.js
export function logErrorToService(error, componentStack = null) {
    // If componentStack is provided, you can log it too
    if (componentStack) {
        console.error("Component Stack:", componentStack);
    }
    console.error(error); // For now, just log it to the console
}
