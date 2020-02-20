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
        this.state = { calculations: [] };
    }

    // update the calculations in state, which will update the table
    getCalculationData = calculations => this.setState({ calculations });

    changeCalcData = () => socket.emit("initial_calc_data");

    componentDidMount() {
        socket.emit("initial_calc_data");
        socket.on("get_calc_data", this.getCalculationData);
        socket.on("change_calc_data", this.changeCalcData);
    }

    componentWillUnmount() {
        socket.off("get_calc_data");
        socket.off("change_calc_data");
    }

    // do the math and then send the resulting string to the server
    calculate = () => {
        // get the input string
        let input = document.getElementById("calc-input").value;
        if (input.length === 0) return;

        // get an array of numbers and operators
        try {
            var parts = getCalculationParts(input);
        } catch (error) {
            if (typeof error === "string") return this.setState({ error });
            else return this.setState({ error: "Invalid calculation." });
        }

        console.log("parts: ", parts);
        // calculate the result from those parts
        const result = calculateFromParts(parts);

        console.log("result: ", result);

        let equation = input;

        // remove the error notification if it exists
        if (this.state.error) this.setState({ error: false });

        console.log("success");

        // send the full equation string to the backend
        // sendCalculation(equation);
    };

    render() {
        const { error, calculations } = this.state;
        return (
            <div className="App">
                <Container>
                    <h2 className="h2Class">Big Brother Calculator</h2>

                    {!!error && <div className="error">{error}</div>}
                    <input type="text" id="calc-input" />
                    <Button onClick={this.calculate}>Send</Button>

                    <CalculationTable calculations={calculations} />
                </Container>
            </div>
        );
    }
}

// shows the previous 10 calculations
const CalculationTable = ({ calculations }) => (
    <Table striped id="table-to-xls">
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
