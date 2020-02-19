import React, { Component } from "react";
import { Button, Table, Container } from "reactstrap";

import socketIOClient from "socket.io-client";
let socket;
const endpoint = "http://localhost:3001/"; // Update 3001 with port on which backend-my-app/server.js is running.
socket = socketIOClient(endpoint);

class Calculator extends Component {
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

    // send the calculation to the database
    sendCalculation = calculation => {
        socket.emit("send_calculation", calculation);
    };

    calculationRows = () => {
        return this.state.calculations.map(calculation => {
            return (
                <tr key={calculation._id}>
                    <td>{calculation.equation}</td>
                </tr>
            );
        });
    };

    // update the input and state when the input box is changed
    onTextChange = event => {
        this.setState({ text: event.currentTarget.value });
    };

    render() {
        return (
            <Container>
                <h2 className="h2Class">Big Brother Calculator</h2>

                <input
                    type="text"
                    value={this.state.text}
                    onChange={this.onTextChange}
                />
                <Button onClick={() => this.sendCalculation(this.state.text)}>
                    Send
                </Button>

                <Table striped id="table-to-xls">
                    <thead>
                        <tr>
                            <th>Prior Calculations</th>
                        </tr>
                    </thead>
                    <tbody>{this.calculationRows()}</tbody>
                </Table>
            </Container>
        );
    }
}

export default Calculator;
