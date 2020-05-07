import React, { useState, useContext } from 'react'

import './_menu.scss';

import Button from '@material-ui/core/Button';

const BobMenu = ({options, activeTab, changeTab}) => {
    return <div className='bob-menu'>
        {options.map((o, id) => <Button 
            key={id}
            className={o.cl + (id == activeTab ? ' focus': '')}
            onClick={_ => changeTab(id)}
        >
            {o.icon}
        </Button>)}
    </div>
}

export default BobMenu;