
/*
If debugging is set to true then the start up file, index.html, has to be the one that does not reference 
     http://localhost/AmazingD3
This is normally maintained as file indexd.html, where the "d" stands for development. The version of index.html 
that references Sunclock is the production version. When not in use, it should be renamed to indexp.html, where
the "p" stands for production.
*/
var debugging = true;
var SunclockServices = angular.module('SunclockServices', ['ngResource']);

var AmazingD3App = angular.module('AmazingD3App', ['ngRoute', 'SunclockServices']);