import React, { Component } from "react";
import { Button, Table, Container } from "reactstrap";
import { socket } from "../global/header";

class Calculator extends Component {
    constructor() {
        super();
        this.state = {
            food_data: []
            // this is where we are connecting to with sockets,
        };
    }

    getData = calculations => {
        console.log(calculations);
        this.setState({ food_data: calculations });
    };

    changeData = () => socket.emit("initial_data_calcs");

    componentDidMount() {
        var state_current = this;
        socket.emit("initial_data");
        socket.on("get_data", this.getData);
        socket.on("change_data", this.changeData);
    }

    componentWillUnmount() {
        socket.off("get_data");
        socket.off("change_data");
    }

    // markDone = id => {
    //     socket.emit("mark_done", id);
    // };

    // send the calculation to the database
    sendCalculation = calculation => {
        socket.emit("send_calculation", calculation);
    };

    getCalculationData() {
        return this.state.food_data.map(food => {
            return (
                <tr key={food._id}>
                    <td>{food._id}</td>
                </tr>
            );
        });
    }

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
                <button onClick={() => this.sendCalculation(this.state.text)}>
                    Send
                </button>

                <Table striped id="table-to-xls">
                    <thead>
                        <tr>
                            <th>Prior Calculations</th>
                        </tr>
                    </thead>
                    <tbody>{this.getCalculationData()}</tbody>
                </Table>
            </Container>
        );
    }
}

export default Calculator;
