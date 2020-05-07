import React, { Component, useState, useContext, useEffect } from 'react';
import { userContext } from '../user-context/user-context';

import './_news.scss';

import Button from '@material-ui/core/Button';
import RefreshRoundedIcon from '@material-ui/icons/RefreshRounded';

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
        {news.map((n, id) => {
            return <div className={'new' + (n.image? ' with-img': '')} key={id} >
                <h3><a href={n.url} target='_blank'>{n.name}</a></h3>
                <span>{n.description}</span>
                <span className='link'>
                    <a href={n.url} target='_blank'>{n.url}</a>
                </span>
                {n.image? <img src={n.image.thumbnail.contentUrl} />:null}
            </div>
        })}
    </div>
}

export default News