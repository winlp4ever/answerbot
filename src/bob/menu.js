import React, { useState, useContext } from 'react'

import './_menu.scss';

import Button from '@material-ui/core/Button';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';

import Auth from '../user-auth/user-auth';
import { userContext } from '../user-context/user-context';

const BobMenu = ({options, activeTab, changeTab, toggleMode}) => {
    const [viewUserInfo, setViewUserInfo] = useState(false);

    const toggleViewUserInfo = () => {
        setViewUserInfo(!viewUserInfo);
    }

    const Us = useContext(userContext);
    return <div className='bob-menu'>
        {Us.user.userid? <div className='bob-menu-options'>
            {options.map((o, id) => <Button 
                key={id}
                className={o.cl + (id == activeTab ? ' focus': '')}
                onClick={_ => changeTab(id)}
            >
                {o.icon}
            </Button>)}
            <Button className='close' onClick={toggleMode}>
                <img src={require('../../imgs/bob/close.svg')} />
            </Button>
        </div>: null}
    </div>
}

export default BobMenu;