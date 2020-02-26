import React, { Component } from "react";
import { Button, Table, Container } from "reactstrap";

import "./App.css";

import { getCalculationParts, calculateFromParts } from "./util";

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

    // go through the parts start to finish

    // any time you find a ), solve the equation in those parentheses

    // then replace everything that was in parentheses with the new number

    // if you get to the end, solve everything

    // 1 x (3 + (4 - ((6 + 8) - 2)) - (10 x 11))

    // do the math and then send the resulting string to the server
    calculate = () => {
        // get the input string
        let inputEl = document.getElementById("calc-input");
        let input = inputEl.value;
        if (input.length === 0) return;

        // get an array of numbers and operators
        try {
            var parts = getCalculationParts(input);
        } catch (error) {
            if (typeof error === "string") return this.setState({ error });
            else return this.setState({ error: "Invalid calculation." });
        }

        // remove the error notification if it exists
        if (this.state.error) this.setState({ error: false });

        // calculate the result from those parts
        const result = calculateFromParts(parts);
        let equation = `${input} = ${result}`;

        // send the full equation string to the backend
        sendCalculation(equation);

        // clear the input box
        inputEl.value = "";
    };

    // when a button in the calculator is clicked
    onButtonClick = event => {
        const text = event.currentTarget.value;
        console.log("Button clicked: ", text);
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
            case ")":
                this.addParenthesis(calcParts, text);
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
    };

    // adds a number to the calculation
    addNumber = (calcParts, text) => {
        // if there is nothing yet, just add the number
        if (calcParts.length == 0) calcParts = [text];
        else {
            const lastIndex = calcParts.length - 1;
            const lastPart = calcParts[lastIndex];
            const lastChar = lastPart.charAt(lastPart.length - 1);

            // if last was and end parenthesis, include a multiply sign
            if (lastPart === ")") calcParts = calcParts.concat(["x", text]);
            // if last was a number or dot or negative symbol, add this to that
            else if (
                numbers.includes(lastChar) ||
                lastChar === "." ||
                lastChar === "_"
            )
                calcParts[lastIndex] = lastPart + text;
            // otherwise just add the number
            else calcParts.push(text);
        }

        this.setState({ calcParts });
    };

    addDecimal = calcParts => {
        // TODO
    };

    // removes the last char from the calculation
    backspace = calcParts => {
        // TODO
    };

    // adds a forward or back parenthesis to the calculation
    addParenthesis = (calcParts, paren) => {
        // TODO
    };

    // adds an x, +, %, or / to the calculation
    addSymbol = (calcParts, text) => {
        // TODO
    };

    // add a - to the calculation
    addSubtraction = calcParts => {
        // TODO
    };

    // calculate the end result and send it to the backend
    calculate = calcParts => {
        // TODO
    };

    showState = () => console.log(this.state.calcParts);

    // TODO CHECK FOR 0 / 0, ANYTHING / 0, DECIMALS

    render() {
        const { error, calculations } = this.state;
        return (
            <div className="App">
                <Container>
                    <h2 className="header">Big Brother Calculator</h2>

                    <button onClick={this.showState}>state</button>

                    {!!error && <div className="error">{error}</div>}
                    <input type="text" id="calc-input" className="calc-input" />
                    <Button onClick={this.calculate}>Send</Button>

                    <CalcButtons onButtonClick={this.onButtonClick} />

                    <CalculationTable calculations={calculations} />
                </Container>
            </div>
        );
    }
}

const CalcButtons = ({ onButtonClick }) => (
    <div className="calc-buttons">
        {buttonTexts.map(text => (
            <div key={text}>
                <Button onClick={onButtonClick} value={text}>
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
