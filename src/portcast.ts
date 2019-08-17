interface ChannelNode {
  channel: MessageChannel;
  outlets: Set<string>;
  handler: (event: MessageEvent) => void;
}

export class PortCast {
  private readonly channelMap: Map<string, ChannelNode> = new Map();
  private readonly rootOutlets: Set<string> = new Set();

  addChannel(name: string, outlets?: string[], channel?: MessageChannel): MessageChannel {
    channel = channel || new MessageChannel();
    if ((!name) || this.channelMap.has(name)) {
      throw new Error('Channel with the key "' + name + '" already defined.');
    }
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

  getOutlets(name: string): Set<string> | undefined {
    if (!name) {
      return this.rootOutlets;
    }
    return this.channelMap.has(name) ? this.channelMap.get(name)!.outlets : undefined;
  }

  postRootMessage(data: any, transfer?: Transferable[]): void {
    this.relayMessage(this.rootOutlets, data, transfer);
  }

  private getHandler(name: string): (event: MessageEvent) => void {
    return (event: MessageEvent) => {
      const node = this.channelMap.get(name);
      if (node) {
        const transfer = (event.ports && event.ports.length) ? Array.from(event.ports) : [];
        this.relayMessage(node.outlets, event.data, transfer);
      }
    };
  }

  private relayMessage(outlets: Set<string>, data: any, transfer?: Transferable[]): void {
    if (outlets && outlets.size) {
      outlets.forEach((o) => {
        const onode = this.channelMap.get(o);
        if (onode) {
          if (transfer) {
            onode.channel.port1.postMessage(data, transfer);
          } else {
            onode.channel.port1.postMessage(data);
          }
        }
      });
    }
  }
}