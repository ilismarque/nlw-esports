export function convertHoursStringToMinutes(hourString: string) {
    // separate hours and minutes from string using split and destructuring in array using map
    const [hour, minutes] = hourString.split(':').map(Number);
    const timeInMinutes = hour * 60 + minutes;
    return timeInMinutes;
}