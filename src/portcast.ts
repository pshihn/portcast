interface ChannelNode {
  channel: MessageChannel;
  outlets: Set<string>;
  handler: (event: MessageEvent) => void;
}

export class PortCast {
  private readonly channelMap: Map<string, ChannelNode> = new Map();
  private readonly rootOutlets: Set<string> = new Set();

  addChannel(name: string, channel?: MessageChannel, outlets?: string[]): MessageChannel {
    channel = channel || new MessageChannel();
    if ((!name) || this.channelMap.has(name)) throw new Error('Channel with the key "' + name + '" already defined.');
    const node: ChannelNode = {
      channel,
      outlets: new Set<string>(outlets || []),
      handler: this.getHandler(name)
    };
    this.channelMap.set(name, node);
    channel.port1.addEventListener('message', node.handler);
    channel.port1.start();
    return channel;
  }

  removeChannel(name: string, closePort: boolean = true): boolean {
    if (this.channelMap.has(name)) {
      const node = this.channelMap.get(name)!;
      this.channelMap.delete(name);
      node.channel.port1.removeEventListener('message', node.handler);
      if (closePort) {
        node.channel.port1.close();
      }
      return true;
    }
    return false;
  }

  addOutlet(name: string, ...outlets: string[]): boolean {
    if (!name) {
      outlets.forEach((o) => this.rootOutlets.add(o));
      return true;
    }
    if (this.channelMap.has(name) && outlets && outlets.length) {
      const node = this.channelMap.get(name)!;
      outlets.forEach((o) => node.outlets.add(o));
      return true;
    }
    return false;
  }

  removeOutlets(name: string, ...outlets: string[]): boolean {
    let set: Set<string> | null = null;
    if (!name) {
      set = this.rootOutlets;
    } else if (this.channelMap.has(name)) {
      set = this.channelMap.get(name)!.outlets;
    }
    let ret = false;
    if (set && outlets && outlets.length) {
      outlets.forEach((o) => {
        ret = set!.delete(o) || ret;
      });
    }
    return ret;
  }

  clearOutlets(name: string): boolean {
    let set: Set<string> | null = null;
    if (!name) {
      set = this.rootOutlets;
    } else if (this.channelMap.has(name)) {
      set = this.channelMap.get(name)!.outlets;
    }
    if (set && set.size) {
      set.clear();
      return true;
    }
    return false;
  }

  private getHandler(name: string): (event: MessageEvent) => void {
    return (event: MessageEvent) => {
      console.log('message event for ' + name, event);
    };
  }
}