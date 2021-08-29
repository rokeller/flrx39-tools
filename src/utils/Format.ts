export function formatNumber(number: number, numDigits: number) {
    let result = number.toString();

    while (result.length < numDigits) {
        result = '0' + result;
    }

    return result;
}
