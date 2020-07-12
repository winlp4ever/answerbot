// react imports
import React, { Component, useReducer } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import { MatomoProvider, createInstance } from '@datapunt/matomo-tracker-react'

// import other cpns
import Auth from '../user-auth/user-auth';
import { userContext } from '../user-context/user-context';
import Bob from '../bob/bob';

// third party imports
import Cookies from 'js-cookie';

// matomo tracker
const instance = createInstance({
    urlBase: 'https://a.docmadi.net/',
})

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
            <MatomoProvider value={instance}>
                <userContext.Provider value={user}>
                    <Bob colorMode={this.state.user.colorMode}/>
                </userContext.Provider>
            </MatomoProvider>
            
        )
    }
}