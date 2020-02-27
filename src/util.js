// operation functions
const modulo = (a, b) => a % b;
const subtract = (a, b) => a - b;
const add = (a, b) => a + b;
const multiply = (a, b) => a * b;
const divide = (a, b) => a / b;

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

// calculates the final value from valid parts
function calculateFromParts(parts) {
    // go through the parts start to finish
    let partIndex = 0;
    while (parts.length > 1) {
        let part = parts[partIndex];

        // if this is the last part and it's not a paren, solve it all
        if (partIndex >= parts.length - 1 && part !== ")")
            parts = [solveNoParens(parts, 0, partIndex)];

        // any time you find a ), solve the equation in those parentheses
        if (part === ")") {
            // find the accompanying "("
            let prevIndex = partIndex - 1;
            while (parts[prevIndex] !== "(") prevIndex = prevIndex - 1;

            // solve the parentheses pair and replace that equation with the found value
            const value = solveNoParens(parts, prevIndex + 1, partIndex - 1);
            parts = parts
                .slice(0, prevIndex)
                .concat(value)
                .concat(parts.slice(partIndex + 1));

            // set the part index to be the current value (will be increased at end of loop)
            partIndex = prevIndex;
        }

        partIndex++;
    }

    return parts[0];
}

export { calculateFromParts, lastInfo, removeLastDot, countParentheses };
