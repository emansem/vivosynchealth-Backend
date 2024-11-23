export const generateEmailToken = () => {
    // Generates a random 5-digit number between 10000 and 99999
    return Math.floor(10000 + Math.random() * 90000).toString();
};