// import react
import React, {Component, useState, useContext, useEffect, useRef} from 'react';
import {userContext} from '../user-context/user-context';

// third party imports
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import SendRoundedIcon from '@material-ui/icons/SendRounded';
import BookmarkBorderRoundedIcon from '@material-ui/icons/BookmarkBorderRounded';
import MinimizeRoundedIcon from '@material-ui/icons/MinimizeRounded';
import SmsFailedOutlinedIcon from '@material-ui/icons/SmsFailedOutlined';
import CollectionsBookmarkOutlinedIcon from '@material-ui/icons/CollectionsBookmarkOutlined';
import ExploreOutlinedIcon from '@material-ui/icons/ExploreOutlined';
import MoreVertOutlinedIcon from '@material-ui/icons/MoreVertOutlined';
import Button from '@material-ui/core/Button';
import io from 'socket.io-client';
import StarBorderRoundedIcon from '@material-ui/icons/StarBorderRounded';
import StarRoundedIcon from '@material-ui/icons/StarRounded';
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import NotificationsActiveRoundedIcon from '@material-ui/icons/NotificationsActiveRounded';
import $ from 'jquery';

// import style file
import './_bob.scss';

// other cpns imports

import MdRender from '../markdown-render/markdown-render';
import BobMenu from './menu';
import Ask, {NewChat} from './ask';
import HistoryBookmarks from './history-bookmarks';
import News from './news';
import Auth from '../user-auth/user-auth';

const RatingLvs = ['totally unrelated!', 'not so helpful', 'contain info', 'very helpful', 'excellent']

const Options = [
    {
        icon: <img src={require('../../imgs/bob/chat.svg')}/>,
        cl: 'view-ask'
    },
    {
        icon: <img src={require('../../imgs/bob/bookmark-history.svg')}/>,
        cl: 'view-bookmarks'
    },
    {
        icon: <img src={require('../../imgs/bob/feed.svg')}/>,
        cl: 'view-explore'
    },
    {
        icon: <img src={require('../../imgs/bob/list.svg')}/>,
        cl: 'view-more'
    },
]

const AnswerInsights = ({content}) => {
    console.log(content.answer.answer_paragraph);
    return <div className='answer-insights'>
        <div className='full-answer'>
            <h4><img src={require('../../imgs/bob/A.svg')} /> Full answer:</h4>
            {content.answer.answer_paragraph.replace('\\n', 'w')}
        </div>
        <div className='orientation'>
            <h4><img src={require('../../imgs/bob/traces.svg')} /> Explore more:</h4>
            {content.answer[12]? <span>{content.answer[12]}</span>: null}
        </div>
    </div>
}


export default class Bob extends Component {
    static contextType = userContext;
    state = {
        hints: [],
        chats: [],
        socket: io(),
        pins: [],
        tab: 0, 
        minimal: true,
        newResponseComing: false,
        instantAnswer: '',
        instantAnswerMsgEnable: false, 
        insight: null
    }

    _setInsight = (cnt) => {
        if (cnt == null) this.setState({insight: null});
        else if (cnt.answer == null) this.setState({insight: null});
        else this.setState({insight: cnt});
        console.log(this.state.insight);
    }

    componentDidMount () {
        this.state.socket.on('bob-msg', msg => {
            if (msg.conversationID == this.context.user.userid) {
                let chats_ = this.state.chats.slice();
                chats_.push(msg.chat);
                let dct = this.context.user;
                dct.history.push(msg.chat);
                this.context.updateUser(dct);

                if (this.state.minimal) {
                    this.setState({
                        chats: chats_, 
                        newResponseComing: true, 
                        instantAnswerMsgEnable: true,
                        instantAnswer: msg.chat.text
                    });
                    setTimeout(() => {
                        this.setState({instantAnswerMsgEnable: false})
                    }, 8000)
                }
                else {
                    this.setState({chats: chats_});
                }
                if ($(".old-chats").length > 0) {
                    $(".old-chats").animate({
                        scrollTop: $('.old-chats')[0].scrollHeight - $('.old-chats')[0].clientHeight + 50
                    }, 500);
                }
                
            }
        })
        this.state.socket.on('new-chat', msg => {
            if (msg.conversationID == this.context.user.userid) {
                let chats_ = this.state.chats.slice();
                chats_.push(msg.chat);
                this.setState({chats: chats_, hints: []});
                if ($(".old-chats").length > 0) {
                    $(".old-chats").animate({
                        scrollTop: $('.old-chats')[0].scrollHeight - $('.old-chats')[0].clientHeight + 50
                    }, 500);
                }
            }
        })
        this.state.socket.on('bob-hints', msg => {
            console.log(msg.hints.length);
            if (msg.conversationID == this.context.user.userid) {
                this.setState({hints: msg.hints})
            }
        })
    }

    componentWillUnmount () {
        this.state.socket.disconnect();
    }

    toggleMode = () => {
        if (this.state.minimal) {
            this.setState({minimal: false, newResponseComing: false});
        } else {
            this.setState({minimal: true});
        }
    }

    changeTab = (id) => {
        this.setState({tab: id});
    }

    render() {
        let main = null;
        if (this.state.tab == 0) {
            main = <Ask 
                socket={this.state.socket}
                chats={this.state.chats}
                hints={this.state.hints}
                setInsight={this._setInsight}
                insight={this.state.insight}
            />
        } else if (this.state.tab == 1) {
            main = <HistoryBookmarks
                setInsight={this._setInsight}
                insight={this.state.insight}
            />
        } else if (this.state.tab == 2) {
            main = <News />
        }

        return <div className='bob-container'>
            {this.state.insight? <AnswerInsights content={this.state.insight} setContent={this._setInsight}/>: null}
            <div className='bob-ava' onClick={this.toggleMode}>
                {this.state.newResponseComing? <span className='notif-res'>
                </span>: null}
                <img src={require('../../imgs/bob/bob_.png')} />
            </div>
            <div className={'bob' + (this.state.minimal? ' minimal': '')}>
                {this.state.minimal & this.state.newResponseComing & this.state.instantAnswerMsgEnable? 
                    <div className='instant-answer'>
                        <span className='msg'>Here's the response, click me to see more details!</span>
                    </div>
                :null}
                {this.state.minimal? <NewChat socket={this.state.socket} hints={this.state.hints} />
                :<div>
                    <Button className='minimize-window' onClick={this.toggleMode}><MinimizeRoundedIcon/></Button>
                    <BobMenu 
                        options={Options} 
                        activeTab={this.state.tab}
                        changeTab={this.changeTab} 
                    />
                    {main}
                </div>}
            </div>
        </div>
    }
}