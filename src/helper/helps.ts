export const calculatePerecentageDff = (totalDifferences: number, lastMonthDff: number, thisMonthDff: number) => {
    let percentage = 0;
    if (thisMonthDff === 0 && lastMonthDff === 0) {
        percentage = 0
    } else if (lastMonthDff === 0 && thisMonthDff > 0) {
        percentage = 100  // When going from 0 to some doctors
    }
    else if (lastMonthDff > 0 && thisMonthDff === 0) {
        percentage = -100 // When losing all doctors
    } else {
        percentage = (totalDifferences / lastMonthDff) * 100
    }
    return { percentage }
}