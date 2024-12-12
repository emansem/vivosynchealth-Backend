
export const getUserCurrentLocation = async () => {
    try {
        const response = await fetch(`http://www.geoplugin.net/json.gp`);
        const data = await response.json();
        return data
    } catch (error) {
        console.log('Error', error);
    }
}


