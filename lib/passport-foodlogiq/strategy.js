'use strict';

var util = require('util');
var OAuth2Strategy = require('passport-oauth2').Strategy;

function Strategy(options, verify) {
  options = options || {};
  options.baseURL = options.baseURL || 'https://www.foodlogiq.com';
  options.authorizationPath = options.authorizationPath || '/oauth/authorize';
  options.tokenPath = options.tokenPath || '/oauth/access_token';
  options.authorizationURL = options.authorizationURL || (options.baseURL + options.authorizationPath);
  options.tokenURL = options.tokenURL || (options.baseURL + options.tokenPath);

  OAuth2Strategy.call(this, options, verify);
  this.name = 'foodlogiq';
  this.baseURL = options.baseURL;
}

util.inherits(Strategy, OAuth2Strategy);

Strategy.prototype.userProfile = function(accessToken, done) {
  var profileUrl = this.baseURL + '/user';
  
  this._oauth2.get(profileUrl, accessToken, function (err, body, res) {
    if (err) { return done(new Error('failed to fetch user profile', err)); }

    try {
      var json = JSON.parse(body);

      var profile = { provider: 'foodlogiq' };
      profile.foodlogiqId = json.foodlogiqId;

      profile.firstName = json.firstName;
      profile.lastName = json.lastName;
      profile.displayName = profile.firstName + ' ' + profile.lastName;
      profile.email = json.email;

      profile._raw = body;
      profile._json = json;

      done(null, profile);
    } catch(e) {
      done(e);
    }
  });
}

var PASS_THRU_PARAMS = [ 
  'email', 'firstName', 'lastName', 'register', 
  'invitationType', 'invitationCode', 'skip_ie_check' 
];

// Allows a flag to be set to send the user directly to the registration page instead of the default login page. 
// Must be handled on the application end to look for the register query, 
// and the use a conditional redirect based on that.
Strategy.prototype.authorizationParams = function(options){
  var opt = {};
  PASS_THRU_PARAMS.forEach(function(p) { if(options[p]) { opt[p] = options[p]; } });
  return opt;
};

module.exports = Strategy;
