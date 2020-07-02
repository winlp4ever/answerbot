// react imports
import React, { Component, useReducer } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

// import other cpns
import Auth from '../user-auth/user-auth';
import { userContext } from '../user-context/user-context';
import Bob from '../bob/bob';

// third party imports
import HomeRoundedIcon from '@material-ui/icons/HomeRounded';
import ViewHeadlineRoundedIcon from '@material-ui/icons/ViewHeadlineRounded';
import VideocamRoundedIcon from '@material-ui/icons/VideocamRounded';
import Cookies from 'js-cookie';

let PARAMS = new URLSearchParams(window.location.search)

console.log(PARAMS)

const DARKTHEME = 1
const LIGHTTHEME = 0

export default class App extends Component {
    state = {
        user: {
            username: '',
            email: '',
            userid: parseInt(PARAMS.get('user')) || 0,
            exerciseid: parseInt(PARAMS.get('exercice')) || 0,
            level: 'Master2',
            history: [],
            bookmarks: {},
            colorMode: 0
        },
        activeTab: 0,
        colorMode: 0
    }

    componentDidMount() {}

    updateUser =  (info) => {
        this.setState({user: info});
    }

    updateColorMode = (md) => this.setState({colorMode: md})

    componentWillUnmount = () => {};

    selectTab = (i) => {
        this.setState({activeTab: i});
    }

    render() {
        const user = {
            user: this.state.user,
            updateUser: this.updateUser
        }

        return (
            <userContext.Provider value={user}>
                <Bob colorMode={this.state.user.colorMode}/>
            </userContext.Provider>
        )
    }
}