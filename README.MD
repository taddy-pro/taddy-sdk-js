Install
=======
```sh
npm i taddy-pro/taddy-sdk
```
Or
```sh
yarn add taddy-pro/taddy-sdk
```
Simple usage
============
```ts
// Import
import TaddySDK from 'taddy-sdk';

// Initialize SDK with your Public ID (pubId)
const taddy = new TaddySDK('miniapp-xxxxxxxxxxxxxxxxxxxxxxxx')

// Sending "ready" event when your app is ready to use
taddy.ready();
```