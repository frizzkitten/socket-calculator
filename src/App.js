import React, { Component } from "react";
import "./App.css";
import { Switch, Route } from "react-router-dom";

import Calculator from "./main/Calculator";

/*The <Route> component is the main part of React Router. Anywhere that you want to only render content based on the location’s pathname, you should use a <Route> element. */

/* The Route component expects a path prop, which is a string that describes the pathname that the route matches */

/* The <Switch> will iterate over routes and only render the first one that matches the current pathname */

class App extends Component {
    render() {
        return (
            <div className="App">
                <Switch>
                    <Route exact path="/" component={Calculator} />
                </Switch>
            </div>
        );
    }
}

export default App;
