import React, { Component } from "react";
import { Button, Table, Container } from "reactstrap";

import "./App.css";

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
        const input = document.getElementById("calc-input").value;

        let equation = input;

        // send the full equation string to the backend
        sendCalculation(equation);
    };

    render() {
        return (
            <div className="App">
                <Container>
                    <h2 className="h2Class">Big Brother Calculator</h2>

                    <input type="text" id="calc-input" />
                    <Button onClick={this.calculate}>Send</Button>

                    <CalculationTable calculations={this.state.calculations} />
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
