import React, { Component, useState, useContext } from 'react';
import './_user-auth.scss';
import { userContext } from '../user-context/user-context';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { Icon } from 'office-ui-fabric-react/lib/Icon';

const Auth = () => {
    const [username, setUsername] = useState('');
    const [pass, setPass] = useState('');
    const [err, setErr] = useState('');

    const handleUsername = e => {
        setUsername(e.target.value);
    }

    const handlePass = (e) => {
        setPass(e.target.value);
    }

    const userdata = useContext(userContext);

    const handleSubmit = async () => {
        if (username == '') return;
        let response = await fetch('/login', {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({username: username, pass: pass})
        });
        let data = await response.json();
        if (data.err != null) {
            setErr(data.err);
            console.log(data);
            return;
        }
        userdata.updateUser(data);
        setUsername('');
        setPass('')
    } 

    const handleEnter = async (e) => {
        let keycode = e.keyCode || e.which;
        if (keycode != 13) return;
        
        e.preventDefault(); // prevents page reloading
        handleSubmit();
    }

    const signOut = async () => {
        userdata.updateUser({username: '', email: '', color: '', level: '', history: [], bookmarks: {}})
    }


    if (userdata.user.username != '') return (<div className='user-panel'>
        <span className='ava' style={{background: userdata.user.color}}>
            {userdata.user.username.substr(0,1).toUpperCase()}
        </span>
        <span>Hi, {userdata.user.username}</span> 
        <Button onClick={signOut}>
            <Icon iconName='SignOut'/>
        </Button>
    </div>)

    let cl = 'auth';
    if (err != '') cl + ' err'
    return (   
        <div className={cl} onKeyPress={handleEnter}>
            <div className='auth-line'>
                <TextField label={err != ''? '*'+err: 'username'} onChange={handleUsername}/>
            </div>
            <div className='auth-line'>
                <TextField label='password' onChange={handlePass} type='password'/>
            </div>
            <Button variant='outlined' onClick={handleSubmit}>Log In</Button>
        </div>
    )
}

export default Auth;