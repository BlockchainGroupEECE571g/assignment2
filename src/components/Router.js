import React from 'react'
import {HashRouter, Route, Switch} from 'react-router-dom';
import App from './App'
import ParcelSender from './ParcelSender'
import Courier from './Courier'
import Receiver from './Receiver'
import { createHashHistory } from 'history';
const hashHistory = createHashHistory();


const MyRoute = () => (
  <HashRouter history={hashHistory}>
  <Switch>
    <Route exact path="/" component={App} />{' '}
      <Route path="/ParcelSender" component={ParcelSender} />{' '}
      <Route path="/Courier" component={Courier} />{' '}
      <Route path="/Receiver" component={Receiver} />{' '}
      </Switch>
  </HashRouter>
)

export default MyRoute
