export function formatNumber(number: number, numDigits: number, radix: number = 10) {
    let result = number.toString(radix);

    while (result.length < numDigits) {
        result = '0' + result;
    }

    return result;
}
