const React = require('react');

function StatusBar(props) {
  return React.createElement('div', { style: { display: 'none' } });
}

function setStatusBarStyle() {}
function setStatusBarHidden() {}
function setStatusBarBackgroundColor() {}
function setStatusBarNetworkActivityIndicatorVisible() {}
function setStatusBarTranslucent() {}

exports.StatusBar = StatusBar;
exports.setStatusBarStyle = setStatusBarStyle;
exports.setStatusBarHidden = setStatusBarHidden;
exports.setStatusBarBackgroundColor = setStatusBarBackgroundColor;
exports.setStatusBarNetworkActivityIndicatorVisible = setStatusBarNetworkActivityIndicatorVisible;
exports.setStatusBarTranslucent = setStatusBarTranslucent;
