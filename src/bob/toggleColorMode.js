import React, {useContext} from 'react'

import { userContext } from '../user-context/user-context'

import './_toggleColorMode.scss'

const ColorSwitch = () => {

    const u = useContext(userContext)

    const changeMode = () => {
        let profile = u.user 
        profile.colorMode = 1-profile.colorMode
        u.updateUser(profile)
    }

    return <label className="color-switch">
        <div className="toggle">
            <input className="toggle-state" type="checkbox" name="check" value="check" onClick={changeMode}/>
            <div className="indicator"></div>
        </div>
    </label>
}

export default ColorSwitch