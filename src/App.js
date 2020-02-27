import React, { Component } from "react";
import { Button, Table, Container } from "reactstrap";

import "./App.css";

import {
    getCalculationParts,
    lastInfo,
    removeLastDot,
    countParentheses,
    solveNoParens
} from "./util";

import socketIOClient from "socket.io-client";
let socket;
const endpoint = "http://localhost:3001/"; // Update 3001 with port on which backend-my-app/server.js is running.
socket = socketIOClient(endpoint);

// send the calculation to the database
const sendCalculation = calculation =>
    socket.emit("send_calculation", calculation);

const numbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const buttonTexts = [
    "(",
    ")",
    "%",
    "C",
    "7",
    "8",
    "9",
    "/",
    "4",
    "5",
    "6",
    "x",
    "1",
    "2",
    "3",
    "-",
    "0",
    ".",
    "=",
    "+"
];

class App extends Component {
    constructor(props) {
        super(props);
        // socket will fill in the calculations
        this.state = { calculations: [], calcParts: [] };
    }

    // update the calculations in state, which will update the table
    getCalculationData = calculations => this.setState({ calculations });

    changeCalcData = () => socket.emit("initial_data");

    componentDidMount() {
        socket.emit("initial_data");
        socket.on("get_data", this.getCalculationData);
        socket.on("change_data", this.changeCalcData);
    }

    componentWillUnmount() {
        socket.off("get_data");
        socket.off("change_data");
    }

    // // do the math and then send the resulting string to the server
    // calculate = () => {
    //     // get the input string
    //     let inputEl = document.getElementById("calc-input");
    //     let input = inputEl.value;
    //     if (input.length === 0) return;
    //
    //     // get an array of numbers and operators
    //     try {
    //         var parts = getCalculationParts(input);
    //     } catch (error) {
    //         if (typeof error === "string") return this.setState({ error });
    //         else return this.setState({ error: "Invalid calculation." });
    //     }
    //
    //     // remove the error notification if it exists
    //     if (this.state.error) this.setState({ error: false });
    //
    //     // calculate the result from those parts
    //     const result = calculateFromParts(parts);
    //     let equation = `${input} = ${result}`;
    //
    //     // send the full equation string to the backend
    //     sendCalculation(equation);
    //
    //     // clear the input box
    //     inputEl.value = "";
    // };

    // when a button in the calculator is clicked
    onButtonClick = event => {
        const text = event.currentTarget.value;
        // remove the error message
        this.setState({ error: undefined }, () => {
            let { calcParts } = this.state;

            switch (text) {
                case "0":
                case "1":
                case "2":
                case "3":
                case "4":
                case "5":
                case "6":
                case "7":
                case "8":
                case "9":
                    this.addNumber(calcParts, text);
                    break;
                case ".":
                    this.addDecimal(calcParts);
                    break;
                case "C":
                    this.backspace(calcParts);
                    break;
                case "(":
                    this.addLeftParenthesis(calcParts);
                    break;
                case ")":
                    this.addRightParenthesis(calcParts);
                    break;
                case "%":
                case "+":
                case "x":
                case "/":
                    this.addSymbol(calcParts, text);
                    break;
                case "-":
                    this.addSubtraction(calcParts);
                    break;
                case "=":
                    this.calculate(calcParts);
                    break;
                default:
                    return this.setState({
                        error: "Something has gone horribly wrong."
                    });
            }
        });
    };

    // adds a number to the calculation
    addNumber = (calcParts, text) => {
        const { numParts, lastPart, lastChar } = lastInfo(calcParts);

        // if there is nothing yet, just add the number
        if (numParts === 0) calcParts = [text];
        else {
            // if last was and end parenthesis, include a multiply sign
            if (lastPart === ")") calcParts = calcParts.concat(["x", text]);
            // if last was a number or dot or negative symbol, add this to that
            else if (
                numbers.includes(lastChar) ||
                lastChar === "." ||
                lastChar === "_"
            )
                calcParts[calcParts.length - 1] = lastPart + text;
            // otherwise just add the number
            else calcParts.push(text);
        }

        this.setState({ calcParts });
    };

    // adds a decimal point - same as a number but can't be added if a number
    // already has a decimal point in it
    addDecimal = calcParts => {
        const { numParts, lastPart } = lastInfo(calcParts);

        // if there is nothing in calcParts, add a dot
        if (numParts === 0) return this.setState({ calcParts: ["."] });

        // as long as there is no decimal already, treat it as a number
        if (!lastPart.includes(".")) this.addNumber(calcParts, ".");
    };

    // removes the last char from the calculation
    backspace = calcParts => {
        // do nothing if there's nothing typed in
        const { numParts, lastPart } = lastInfo(calcParts);
        if (numParts === 0) return;

        const lastPartLength = lastPart.length;
        // if the last part is only one character, just remove it
        if (lastPartLength === 1) calcParts.pop();
        // otherwise remove the last character of the last part
        else
            calcParts[numParts - 1] = lastPart.substring(0, lastPartLength - 1);

        this.setState({ calcParts });
    };

    // adds a start parenthesis to the calculation
    addLeftParenthesis = calcParts => {
        // cut out the last dot if the last character is a dot
        calcParts = removeLastDot(calcParts);

        const { numParts, lastChar } = lastInfo(calcParts);

        // add the parenthesis if there are no other parts
        if (numParts === 0) calcParts.push("(");
        else {
            // if the last character is a number or end paren, add a multiplication symbol
            if (numbers.concat(")").includes(lastChar)) calcParts.push("x");

            // add in the left parenthesis
            calcParts.push("(");
        }

        this.setState({ calcParts });
    };

    // adds an end parenthesis to the calculation
    addRightParenthesis = calcParts => {
        // there have to be more left parens than rights to add a right one
        const [numLeft, numRight] = countParentheses(calcParts);
        if (numLeft <= numRight) return;

        const { lastChar } = lastInfo(calcParts);

        // if the last character is a number, add a right paren
        if (numbers.concat(")").includes(lastChar)) {
            calcParts.push(")");
            this.setState({ calcParts });
        }
    };

    // adds an x, +, %, or / to the calculation
    addSymbol = (calcParts, text) => {
        const { lastChar } = lastInfo(calcParts);

        if (numbers.concat(")").includes(lastChar)) {
            this.setState({ calcParts: calcParts.concat(text) });
        }
    };

    // add a - to the calculation
    addSubtraction = calcParts => {
        calcParts = removeLastDot(calcParts);

        const { lastChar } = lastInfo(calcParts);

        // do nothing if the last character is a - already
        if (lastChar === "-") return;
        // add subtract symbol for subtraction
        else if (numbers.concat([")"]).includes(lastChar)) calcParts.push("-");
        // add underscore for negative
        else calcParts.push("_");

        this.setState({ calcParts });
    };

    // calculate the end result and send it to the backend
    calculate = calcParts => {
        // make a copy
        let parts = calcParts.slice(0);
        // if there is no equation, don't do anything
        if (parts.length === 0 || (parts[0] === "_" && parts.length === 1))
            return;

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
                const value = solveNoParens(
                    parts,
                    prevIndex + 1,
                    partIndex - 1
                );
                parts = parts
                    .slice(0, prevIndex)
                    .concat(value)
                    .concat(parts.slice(partIndex + 1));

                // set the part index to be the current value (will be increased at end of loop)
                partIndex = prevIndex;
            }

            partIndex++;
        }

        const result = parts[0];

        // check for divide by 0 errors
        if (isNaN(result) || result === Infinity)
            return this.setState({ error: "Divide by 0 error" });

        const input = getPartsDisplay(this.state.calcParts);
        const equation = `${input} = ${result}`;

        // send the full equation string to the backend
        sendCalculation(equation);

        // clear the input
        this.setState({ calcParts: [] });
    };

    getCanClickEnter = () => {
        const parts = this.state.calcParts;
        const [leftParens, rightParens] = countParentheses(parts);
        return (
            parts.length > 0 &&
            !["+", "-", "_", ".", "x", "%"].includes(parts[parts.length - 1]) &&
            leftParens === rightParens
        );
    };

    render() {
        const { error, calculations, calcParts } = this.state;
        return (
            <div className="App">
                <Container>
                    <h2 className="header">Big Brother Calculator</h2>

                    {!!error && <div className="error">{error}</div>}

                    <PartsDisplay parts={calcParts} />

                    <CalcButtons
                        onButtonClick={this.onButtonClick}
                        canClickEnter={this.getCanClickEnter()}
                    />

                    <CalculationTable calculations={calculations} />
                </Container>
            </div>
        );
    }
}

// reduce all the parts down to one string to show
const PartsDisplay = ({ parts }) => (
    <div className="parts-display">{getPartsDisplay(parts)}</div>
);
const getPartsDisplay = calcParts => calcParts.reduce(partsReducer, "");
const partsReducer = (stringSoFar, part) =>
    stringSoFar + (part.startsWith("_") ? "-" + part.substr(1) : part);

const CalcButtons = ({ onButtonClick, canClickEnter }) => (
    <div className="calc-buttons">
        {buttonTexts.map(text => (
            <div key={text}>
                <Button
                    onClick={onButtonClick}
                    value={text}
                    disabled={text === "=" && !canClickEnter}
                >
                    {text}
                </Button>
            </div>
        ))}
    </div>
);

// shows the previous 10 calculations
const CalculationTable = ({ calculations }) => (
    <Table striped id="table-to-xls" className="table">
        <thead>
            <tr>
                <th>Prior Calculations</th>
            </tr>
        </thead>
        <tbody>
            {calculations.map(calculation => (
                <tr key={calculation._id}>
                    <td>{calculation.equation}</td>
                </tr>
            ))}
        </tbody>
    </Table>
);

export default App;
