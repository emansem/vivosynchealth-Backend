
export const generateDoctorId = () => {

    let result = "D";
    for (let i = 0; i < 6; i++) {

        result += Math.floor(Math.random() * 10);

    }
    return result;
}

export const generatePatientId = () => {

    let result = "P";
    for (let i = 0; i < 6; i++) {

        result += Math.floor(Math.random() * 10);

    }
    return result;
}

