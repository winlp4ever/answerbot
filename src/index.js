import React, {Component} from "react";
import ReactDOM from "react-dom";
import "./_common.scss";
import App from './app/app';
import './behaviors';
import $ from 'jquery';


function renderWeb() {
    ReactDOM.render(<App />, document.getElementById('main'));
}
renderWeb();


if (module.hot) {
    module.hot.accept(
        [
            './app/app', 
        ], () => {
            renderWeb();
        }
    );
    module.hot.accept();
}