export class PortCast {
    constructor() {
        this.channelMap = new Map();
        this.rootOutlets = new Set();
    }
    addChannel(name, outlets, channel) {
        channel = channel || new MessageChannel();
        if ((!name) || this.channelMap.has(name)) {
            throw new Error('Channel with the key "' + name + '" already defined.');
        }
        const node = {
            channel,
            outlets: new Set(outlets || []),
            handler: this.getHandler(name)
        };
        this.channelMap.set(name, node);
        channel.port1.addEventListener('message', node.handler);
        channel.port1.start();
        return channel;
    }
    removeChannel(name, closePort = true) {
        if (this.channelMap.has(name)) {
            const node = this.channelMap.get(name);
            this.channelMap.delete(name);
            node.channel.port1.removeEventListener('message', node.handler);
            if (closePort) {
                node.channel.port1.close();
            }
            return true;
        }
        return false;
    }
    getOutlets(name) {
        if (!name) {
            return this.rootOutlets;
        }
        return this.channelMap.has(name) ? this.channelMap.get(name).outlets : undefined;
    }
    postRootMessage(data, transfer) {
        this.relayMessage(this.rootOutlets, data, transfer);
    }
    getHandler(name) {
        return (event) => {
            const node = this.channelMap.get(name);
            if (node) {
                const transfer = (event.ports && event.ports.length) ? Array.from(event.ports) : [];
                this.relayMessage(node.outlets, event.data, transfer);
            }
        };
    }
    relayMessage(outlets, data, transfer) {
        if (outlets && outlets.size) {
            outlets.forEach((o) => {
                const onode = this.channelMap.get(o);
                if (onode) {
                    if (transfer) {
                        onode.channel.port1.postMessage(data, transfer);
                    }
                    else {
                        onode.channel.port1.postMessage(data);
                    }
                }
            });
        }
    }
}
