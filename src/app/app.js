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

export default class App extends Component {
    state = {
        user: {
            username: '',
            email: '',
            color: '',
            userid: 1,
            level: 'Master2',
            history: [],
            bookmarks: {}
        },
        activeTab: 0,
    }

    componentDidMount() {
        let userdata = Cookies.get('user');
        if (userdata) {
            this.setState({user: JSON.parse(userdata)});   
        }
    }

    componentWillUnmount = () => {};

    updateUser =  async (info) => {
        await this.setState(
            {user: info});
        if (info.username != '') {
            Cookies.set('user', this.state.user, {expires: 1});
        } else {
            Cookies.remove('user');
        }
    }

    selectTab = (i) => {
        this.setState({activeTab: i});
    }

    render() {
        const value = {
            user: this.state.user,
            updateUser: this.updateUser
        }

        return (
            <userContext.Provider value={value}>
                {
                    (this.state.user.username != '') ? <div>
                        <Bob />
                    </div>: null
                }
                <Auth />
                
            </userContext.Provider>
        )
    }
}