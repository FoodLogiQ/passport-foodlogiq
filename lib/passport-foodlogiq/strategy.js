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

//allows a flag to be set to send the user directly to the registration page instead of the default login page. Must be handled on the application end to look for the register query, and the use a conditional redirect based on that.
Strategy.prototype.authorizationParams = function(options){
  var opt = {};
  if(options.email){opt.email=options.email};
  if(options.firstName){opt.firstName=options.firstName};
  if(options.lastName){opt.lastName=options.lastName};
  if(options.register){opt.register=options.register};
  return opt;
};

module.exports = Strategy;