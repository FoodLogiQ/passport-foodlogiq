var util = require('util')
  , OAuth2Strategy = require('passport-oauth').OAuth2Strategy
  , InternalOAuthError = require('passport-oauth').InternalOAuthError;


function Strategy(options, verify) {
  options = options || {};
  options.authorizationURL = options.authorizationURL || 'https://www.foodlogiq.com/oauth/authorize';
  options.tokenURL = options.tokenURL || 'https://www.foodlogiq.com/oauth/token';
  
  OAuth2Strategy.call(this, options, verify);
  this.name = 'foodlogiq';
}

util.inherits(Strategy, OAuth2Strategy);

Strategy.prototype.userProfile = function(accessToken, done) {
  var profileUrl = 'https://www.foodlogiq.com/api/user';
  
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