const validNumbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const validOperators = ["^", "x", "-", "/", "+"];
const validSymbols = validNumbers.concat(validOperators);

// takes an input string and returns an array of numbers and operators
function getCalculationParts(input) {
    // remove all the spaces
    input = input.replace(/\s/g, "");

    // check if there are invalid characters
    if (input.split("").some(c => !validSymbols.includes(c)))
        throw "Only numbers, spaces, and ^x+-/ are allowed.";

    let partIsNumber = true;
    let parts = [];
    while (input.length > 0) {
        // part should be a number
        if (partIsNumber) {
            const number = parseInt(input, 10);
            const numberString = `${number}`;

            // if it's NaN that means the first number couldn't be read,
            // so it must be an operator
            if (isNaN(number)) throw "Can't start with an operator.";

            // if the input doesn't start with this number,
            // there must be some operator before it,
            // which means there were two operators in a row
            if (!input.startsWith(numberString))
                throw "Can't have two operators in a row.";

            // add the number and remove it from the input string
            parts.push(number);
            input = input.substring(numberString.length);
            // set the next part to be an operator
            partIsNumber = false;
        }
        // add the operator, then say that the next thing should be a number
        else {
            if (input.length === 1) throw "Can't end with an operator.";

            parts.push(input.charAt(0));
            input = input.substring(1);
            partIsNumber = true;
        }
    }

    return parts;
}

// operation functions
const modulo = (a, b) => a % b;
const subtract = (a, b) => a - b;
const add = (a, b) => a + b;
const multiply = (a, b) => a * b;
const divide = (a, b) => a / b;

// get a result from a list of numbers and operators;
// it's known that every even index will be a number
// and every odd index will be an operator
// function calculateFromParts(p) {
//     // make a new copy of the parts array
//     let parts = p.slice(0);
//
//     // go through each operator
//     while (parts.length > 1) {
//         // exponents
//         parts = doOperations(parts, [{ symbol: "^", operation: power }]);
//
//         // multiplication and division
//         parts = doOperations(parts, [
//             { symbol: "x", operation: multiply },
//             { symbol: "/", operation: divide }
//         ]);
//         // addition and subtraction
//         parts = doOperations(parts, [
//             { symbol: "+", operation: add },
//             { symbol: "-", operation: subtract }
//         ]);
//     }
//
//     return parts[0];
// }

// takes in an array of numbers and symbols and a list
// of wanted operations to do in the form of
// [{ symbol: "x", operations: multiply }, ...]
function doOperations(p, operations) {
    let parts = p.slice(0);

    let partIndex = 1;
    while (partIndex < parts.length) {
        const symbol = parts[partIndex];

        // see if the symbol is one of the wanted ones
        let o;
        operations.forEach(op => {
            if (op.symbol === symbol) o = op;
        });

        // do the operation if the symbol is wanted
        if (o) {
            // calculate the result of multiplying or dividing the
            // numbers before and after the operator
            const num1 = parseFloat(parts[partIndex - 1]);
            const num2 = parseFloat(parts[partIndex + 1]);
            const result = o.operation(num1, num2);

            parts = parts
                .slice(0, partIndex - 1)
                .concat(result)
                .concat(parts.slice(partIndex + 2));
        }
        // otherwise move on to the next operator
        else partIndex += 2;
    }

    return parts;
}

// returns the number of elements, the last element, and the last character of the last element
function lastInfo(calcParts) {
    const numParts = calcParts.length;
    const lastPart = numParts ? calcParts[numParts - 1] : undefined;
    const lastChar = lastPart
        ? lastPart.charAt(lastPart.length - 1)
        : undefined;

    return { numParts, lastPart, lastChar };
}

// removes the last "." from calcParts if the last one is indeed a dot
function removeLastDot(calcParts) {
    const { numParts, lastPart, lastChar } = lastInfo(calcParts);

    // don't cut anything out if the last character is not a dot
    if (lastChar !== ".") return calcParts;

    // cut off the last character of the last part
    const newLastPart = lastPart.substr(0, lastPart.length - 1);

    // if the part is now empty, get rid of it
    if (newLastPart === "") calcParts = calcParts.slice(0, numParts - 1);
    // otherwise, change the old last part into this new one without the dot
    else calcParts[numParts - 1] = newLastPart;

    return calcParts;
}

// count the left and right parentheses
function countParentheses(calcParts) {
    let leftCount = 0;
    let rightCount = 0;

    // go through each part
    calcParts.forEach(part => {
        if (part === "(") leftCount++;
        else if (part === ")") rightCount++;
    });

    return [leftCount, rightCount];
}

// solve an equation that has no parentheses
function solveNoParens(p, leftIndex, rightIndex) {
    let parts = p
        .slice(leftIndex, rightIndex + 1)
        .map(part =>
            typeof part === "string" && part.startsWith("_")
                ? "-" + part.substr(1)
                : part
        );

    // multiplication, division, and modulo
    parts = doOperations(parts, [
        { symbol: "x", operation: multiply },
        { symbol: "/", operation: divide },
        { symbol: "%", operation: modulo }
    ]);
    // addition and subtraction
    parts = doOperations(parts, [
        { symbol: "+", operation: add },
        { symbol: "-", operation: subtract }
    ]);

    return parts[0];
}

export {
    getCalculationParts,
    lastInfo,
    removeLastDot,
    countParentheses,
    solveNoParens
};
