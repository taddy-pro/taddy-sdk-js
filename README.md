Include SDK
===========
npm
```shell
npm i taddy-sdk
```
yarn
```shell
yarn add taddy-sdk
```
or using CDN services
```html
<!-- jsdelivr.com -->
<script src="https://cdn.jsdelivr.net/npm/taddy-sdk/dist/taddy.min.js"></script>

<!-- unpkg.com -->
<script src="https://unpkg.com/taddy-sdk/dist/taddy.min.js"></script>
```

Simple usage
============
```ts
// Import Taddy SDK
import { Taddy } from 'taddy-sdk';

// Initialize SDK with your Public ID (pubId)
const taddy = new Taddy('miniapp-xxxxxxxxxxxxxxxxxxxxxxxx')

// Send "ready" event when your app is ready to use
taddy.ready();

// Get tasks
taddy.tasks({ limit: 4 }).then(tasks => {
  // Display tasks
  display(tasks)
  // Send "impressions" event to roll stats
  taddy.impressions(tasks);
})

// Alternative way
taddy.tasks({ limit: 4, autoImpressions: true }).then(tasks => {
  // Display tasks
  display(tasks)
})

// Open task via Telegram WebApp API
taddy.open(task).then(() => {
  // Task completed! 
  // Get reward, remove task from list, refresh tasks, etc...
}).catch(err => {
  // Something went wrong
})
```

Custom events
=============
Taddy supports up to 4 custom events: `custom1`, `custom2`, `custom3`, `custom4`.
Each event can be added with its value. By default, an event does not contain a value.
You can also specify a negative value, for example to record expenses (user spent some system resources, used third-party paid services)

Use case: For example, you have a game, and you can send event `custom1` when the first level is completed. 
You can also send event `custom2` when a payment is attempted, and event `custom3` with value after successful payment.
If user spent some system resources, let's also record that in the report by sending `custom4` event with negative value.

```ts
// Example: User completed the first level
// Rollup custom1 with no value. 
taddy.customEvent('custom1')

// Example: User attempted to pay
// Rollup custom2 with no value. 
taddy.customEvent('custom2')

// Example: User made a purchase for 5.99
// Rollup custom3 with value 5.99
taddy.customEvent('custom3', 5.99)

// Example: user spent some system resources
// Rollup custom4 with negative value -0.05
taddy.customEvent('custom4', -0.05)
```