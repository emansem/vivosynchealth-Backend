export const getWeekRange = (anyDate: Date) => {
    // First, figure out what day of the week we're on
    const dayNumber = anyDate.getDay();

    // Calculate how many days we need to go backwards to reach Monday
    const daysToGoBack = dayNumber === 0 ? 6 : dayNumber - 1;

    // Create Monday's date
    const startOfWeek = new Date(anyDate);
    startOfWeek.setDate(anyDate.getDate() - daysToGoBack);
    startOfWeek.setHours(0, 0, 0, 0);  // Start at midnight

    // Create Sunday's date (always 6 days after Monday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);  // End at last millisecond

    return { start: startOfWeek, end: endOfWeek };
};