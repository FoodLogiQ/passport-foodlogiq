var util = require('util')
  , OAuth2Strategy = require('passport-oauth').OAuth2Strategy
  , InternalOAuthError = require('passport-oauth').InternalOAuthError;


function Strategy(options, verify) {
  options = options || {};
  options.baseURL = options.baseURL || 'https://www.foodlogiq.com';
  options.authorizationURL = options.authorizationURL || (options.baseURL + options.authorizationPath);
  options.tokenURL = options.tokenURL || (options.baseURL + options.tokenPath);
  
  OAuth2Strategy.call(this, options, verify);
  this.name = 'foodlogiq';
  this.baseURL = options.baseURL;
}

util.inherits(Strategy, OAuth2Strategy);

Strategy.prototype.userProfile = function(accessToken, done) {
  var profileUrl = this.baseURL + '/api/user';
  
  this._oauth2.get(profileUrl, accessToken, function (err, body, res) {
    if (err) { return done(new InternalOAuthError('failed to fetch user profile', err)); }
    
    try {
      var json = JSON.parse(body);
      console.dir(json);
      
      var profile = { provider: 'foodlogiq' };
      profile.foodlogiqId = json._id;

      profile.firstName = json.first_name;
      profile.lastName = json.last_name;
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

module.exports = Strategy;