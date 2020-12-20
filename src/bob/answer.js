import React, {Component, useState, useContext, useEffect, useRef} from 'react'
import {userContext} from '../user-context/user-context'

import Button from '@material-ui/core/Button'
import {CSSTransition} from 'react-transition-group';

import './_answer.scss'
import MdRender from '../markdown-render/markdown-render'
import AskRequest from './ask-request'
import {postForData} from '../utils'

// import svgs
import RatingIcon from '../../imgs/bob/rating.svg'
import StarIcon from '../../imgs/bob/star.svg'
import _StarIcon from '../../imgs/bob/_star.svg'
import PinIcon from '../../imgs/bob/pin.svg'
import _PinIcon from '../../imgs/bob/_pin.svg'
import {Maximize2, Bookmark, Star} from 'react-feather'


const Answer = ({content, socket, setIns}) => {
    const Us = useContext(userContext)

    const [pin, setPin] = useState(false)
    const [foc, setFoc] = useState(false)
    const [showAnswer, setShowAnswer] = useState(false)

    const _retrieveMsg = async () => {
        if (content.text != '') {
            if (content.answer.fuzzy) {
                setShowAnswer(false)
            }
            else {
                setShowAnswer(true)
            }
        } else {
            setShowAnswer(false)
        }
    }

    useEffect(() => {
        _retrieveMsg()
    }, [])

    const handleClick = () => {
        if (foc) setIns(null)
        else setIns(content)
        setFoc(!foc)
    }

    const togglePin = () => {
        setPin(!pin)
    }

    return <div>
        {showAnswer && <div 
            className={'answer' + (foc? ' foc': '')} 
        >
            
            <div className='taskbar'>
                <Button className={pin? 'pinned' : 'pin'} 
                    onClick={togglePin}
                >
                    <Bookmark/>
                </Button>
                <Button className={'open-next-to' + (foc ? ' clicked': '')} 
                    onClick={handleClick}
                >
                    <Maximize2 />
                </Button>
            </div>
            
            <span 
                className='answer-text' 
            > 
                <MdRender source={content.answer.text} />
                
            </span>
            <Button className='see-more' onClick={handleClick}>(see more)...</Button>
        </div>}
        
    </div>
}

export default Answer