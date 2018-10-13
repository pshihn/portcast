# PortCast

A small library (_480 bytes gzipped_) that allows multicasting for [Channel Messaging API](https://developer.mozilla.org/en-US/docs/Web/API/Channel_Messaging_API)

Normally, a [MessageChannel](https://developer.mozilla.org/en-US/docs/Web/API/MessageChannel) connects two windows or two workers to each other. Sometimes, one may want to **multicast** a mesage to a number of workers/iframes. This is where _**PortCast**_ comes in.

## Usage

You create a channel with a specified name using PortCast, and provide the names of all the channels its messages should be multicast to. 

In the following example, all messages from `channelA` will be broadcasted to `ChannelB`. All messages from `channelC` will be broadcasted to Channels A, B, D.

```javascript
import { PortCast } from 'portcast';

const portcast = new PortCast();
const channelA = portcast.addChannel('A', ['B']);
const channelB = portcast.addChannel('B', ['A', 'C']);
const channelC = portcast.addChannel('C', ['A', 'B', 'D']);
const channelD = portcast.addChannel('D', ['A']);
```

_Note: PortCast only deals with multicasting the messages on the channel. You have to do yourn own work of passing the channel port to the Worker or the iFrame. See [Using channel messaging](https://developer.mozilla.org/en-US/docs/Web/API/Channel_Messaging_API/Using_channel_messaging) on MDN to get a primer._

## Examples

Here are a couple of live examples to see PortCast in action:

[PortCast with iFrames]()

[PortCast with Web Workers]()

Source code for these pages is available in the [examples folder](https://github.com/pshihn/portcast/tree/master/examples)

## Install

Download the latest from [dist folder](https://github.com/pshihn/portcast/tree/master/dist)

or from npm:
```
npm install --save portcast
```

_PortCast is distributed only as an ES6 module at the moment, but you can easily transpile it._

## License
[MIT License](https://github.com/pshihn/portcast/blob/master/LICENSE) (c) [Preet Shihn](https://twitter.com/preetster)
