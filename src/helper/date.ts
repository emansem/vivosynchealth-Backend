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

// Helper function to get the start and end dates for filtering
export const getMonthlyDateRange = () => {
    const today = new Date();

    // Get first day of current month
    const startOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Get last day of current month
    const endOfThisMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

    // Get first day of last month
    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

    return {
        startOfLastMonth,
        endOfThisMonth
    };
};

export const getMonthDate = (date: string) => {
    // console.log("the month date", new Date(date).getMonth())
    return new Date(date).getMonth() + 1
}

export const calculateMontlyDates = () => {
    // Get current month and handle January case (when lastMonth should be December)
    const today = new Date()
    const thisMonth = today.getMonth() + 1
    const lastMonth = thisMonth === 1 ? 12 : thisMonth - 1
    console.log("last month", lastMonth)
    const { startOfLastMonth, endOfThisMonth } = getMonthlyDateRange()
    return { lastMonth, thisMonth, startOfLastMonth, endOfThisMonth }
}