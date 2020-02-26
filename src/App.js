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
    };

    render() {
        const { error, calculations } = this.state;
        return (
            <div className="App">
                <Container>
                    <h2 className="header">Big Brother Calculator</h2>

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
