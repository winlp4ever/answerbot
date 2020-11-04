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
import { userContext } from '../user-context/user-context';
import Bob from '../bob/bob';

// third party imports
import Cookies from 'js-cookie';
import { v4 as uuidv4 } from 'uuid';

// matomo tracker
const instance = createInstance({
    urlBase: 'https://a.theaiinstitute.ai/',
    siteId: 8
})

let PARAMS = new URLSearchParams(window.location.search)
console.log('parent', window.parent.location.hostname);


export default class App extends Component {
    state = {
        user: {
            username: '',
            email: '',
            userid: parseInt(PARAMS.get('user')) || -1,
            exerciseid: parseInt(PARAMS.get('exercise')) || 0,
            courseid: parseInt(PARAMS.get('course')) || 1,
            chapterid: parseInt(PARAMS.get('chapter')) || 0,
            level: 'Master2',
            colorMode: 0
        },
        activeTab: 0,
        colorMode: 0
    }

    updateUser =  (info) => {
        this.setState({user: info});
    }

    updateColorMode = (md) => this.setState({colorMode: md})

    componentWillUnmount = () => {};

    selectTab = (i) => {
        this.setState({activeTab: i});
    }

    render() {
        if (this.state.user.userid == -1) return null;

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
