import { IonicAuthOptions } from '@ionic-enterprise/auth';

const baseConfig = {
  authConfig: 'cognito' as 'cognito',
  clientID: '4geagm2idmq87fii15dq9toild',
  discoveryUrl: 'https://cognito-idp.us-east-2.amazonaws.com/us-east-2_YU8VQe29z/.well-known/openid-configuration',
  clientSecret: '124dch1p6824ppuef8o71unk14d4pt3p5hnntofvu21i2m960r1g',
  scope: 'openid email profile',
  audience: '',
};

export const mobileAuthConfig: IonicAuthOptions = {
  ...baseConfig,
  redirectUri: 'msauth://login',
  logoutUrl: 'msauth://login',
  platform: 'capacitor',
  iosWebView: 'private',
};

export const webAuthConfig: IonicAuthOptions = {
  ...baseConfig,
  redirectUri: 'http://localhost:8100/login',
  logoutUrl: 'http://localhost:8100/login',
  platform: 'web',
};

export const environment = {
  production: true,
  dataService: 'https://cs-demo-api.herokuapp.com',
};
