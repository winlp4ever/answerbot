import React, { useState, useContext } from 'react'

import './_menu.scss';

import Button from '@material-ui/core/Button';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';

import { userContext } from '../user-context/user-context';

const HelpBox = ({msg}) => {
    return <div className='help-box'>
        {msg}
    </div>
}

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
                <HelpBox msg={o.name} />
                {o.icon}
            </Button>)}
        </div>: null}
    </div>
}

export default BobMenu;