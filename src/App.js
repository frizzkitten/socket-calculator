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

const validNumbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const validOperators = ["x", "-", "/", "+"];
const validSymbols = validNumbers.concat(validOperators);
// returns "operator" if it's a symbol, otherwise returns "number"
// const getType = part => (validOperators.includes(part) ? "operator" : "number");
const getIsOperator = part => validOperators.includes(part);

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

        // remove all the spaces
        input = input.replace(/\s/g, "");

        // check if there are invalid characters
        if (input.split("").some(c => !validSymbols.includes(c))) {
            return this.setState({
                error: "Only numbers, spaces, and x+-/ are allowed."
            });
        }

        let partIsNumber = true;
        let parts = [];
        while (input.length > 0) {
            // part should be a number
            if (partIsNumber) {
                const number = parseInt(input, 10);

                if (isNaN(number)) {
                    return this.setState({
                        error: "Can't start with an operator."
                    });
                }

                const numberString = `${number}`;
                // if the input doesn't start with this number,
                // there must be some operator before it,
                // which means there were two operators in a row
                if (!input.startsWith(numberString)) {
                    return this.setState({
                        error: "Can't have two operators in a row."
                    });
                }
                // add the number and remove it from the input string
                parts.push(number);
                input = input.substring(numberString.length);
                // set the next part to be an operator
                partIsNumber = false;
            }
            // add the operator, then say that the next thing should be a number
            else {
                if (input.length === 1)
                    return this.setState({
                        error: "Can't end with an operator."
                    });

                parts.push(input.charAt(0));
                input = input.substring(1);
                partIsNumber = true;
            }
        }

        console.log("parts: ", parts);

        // let parts = [];
        // const numChars = input.length;
        // let charIndex = 0;
        // while (charIndex < numChars) {
        //     // get the current character
        //     const char = input.charAt(charIndex);
        //     // find out if the character is an operator or number
        //     const isOperator = getIsOperator(char);
        //
        //     // deal with an operator
        //     if (isOperator) {
        //         // if the last character is an operator, this is invalid
        //         if (charIndex === numChars - 1)
        //             return this.setState({ error: "Can't end in an operator" });
        //         // if the first character is an operator ...
        //         else if (charIndex === 0) {
        //             // ... if it's not a -, then it's invalid
        //             if (char !== "-")
        //                 return this.setState({
        //                     error: "Can't start with an operator"
        //                 });
        //         }
        //
        //
        //         // if there are two operators in a row ...
        //         if ()
        //     }
        //
        //     charIndex++
        // }

        // check if the first or last characters are operators
        // let parts = input.split(" ");
        // parts = parts.filter(part => part.length > 0);
        // if (
        //     getType(parts[0]) === "operator" ||
        //     getType(parts[parts.length - 1]) === "operator"
        // ) {
        //     return this.setState({
        //         error: "Cannot start or end with an operator."
        //     });
        // }
        // check if there are any numbers next to each other or symbols
        // next to each other

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
