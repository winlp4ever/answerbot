import React, { Component, useState, useContext, useEffect } from 'react';
import { userContext } from '../user-context/user-context';

import './_news.scss';

import Button from '@material-ui/core/Button';
import RefreshRoundedIcon from '@material-ui/icons/RefreshRounded';
import { CSSTransition } from 'react-transition-group';

import NewsFeedIcon from '../../imgs/bob/newsfeed.svg'

const Feed = ({news}) => {
    return <CSSTransition classNames='news' in={true} timeout={250}>
        <div className={'news' + (news.image? ' with-img': '')}>
            <h3><a href={news.url} target='_blank'>{news.name}</a></h3>
            <span>{news.description}</span>
            <span className='link'>
                <a href={news.url} target='_blank'>{news.url}</a>
            </span>
            {news.image? <img src={news.image.thumbnail.contentUrl} />:null}
        </div>
    </CSSTransition>
    
}

const News = () => {
    const [news, setNews] = useState([]);
    const user = useContext(userContext).user;
    const fetchNews = async () => {
        let response = await fetch('/post-news', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({userid: user.userid})
        })
        let data = await response.json();
        setNews(data.value);
        console.log(data);
    }
    useEffect(() => {
        fetchNews();
    }, [])
    
    
    return <div className='bob-news'>
        <Button onClick={fetchNews} className='refresh'><RefreshRoundedIcon/></Button>
        <CSSTransition in={news.length == 0} unmountOnExit classNames='newsfeeds-illus' timeout={250}>
            <div className='newsfeeds-illus'>
                <NewsFeedIcon />
                <span>Keep up-to-date with latest news in web dev!</span>
            </div>
        </CSSTransition>
        
        {news.map((n, id) => <Feed news={n} key={id}/>)}
    </div>
}

export default News