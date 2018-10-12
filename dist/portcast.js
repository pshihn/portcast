export class PortCast {
    constructor() {
        this.channelMap = new Map();
        this.rootOutlets = new Set();
    }
    addChannel(name, channel, outlets) {
        channel = channel || new MessageChannel();
        if ((!name) || this.channelMap.has(name))
            throw new Error('Channel with the key "' + name + '" already defined.');
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
    addOutlet(name, ...outlets) {
        if (!name) {
            outlets.forEach((o) => this.rootOutlets.add(o));
            return true;
        }
        if (this.channelMap.has(name) && outlets && outlets.length) {
            const node = this.channelMap.get(name);
            outlets.forEach((o) => node.outlets.add(o));
            return true;
        }
        return false;
    }
    removeOutlets(name, ...outlets) {
        let set = null;
        if (!name) {
            set = this.rootOutlets;
        }
        else if (this.channelMap.has(name)) {
            set = this.channelMap.get(name).outlets;
        }
        let ret = false;
        if (set && outlets && outlets.length) {
            outlets.forEach((o) => {
                ret = set.delete(o) || ret;
            });
        }
        return ret;
    }
    clearOutlets(name) {
        let set = null;
        if (!name) {
            set = this.rootOutlets;
        }
        else if (this.channelMap.has(name)) {
            set = this.channelMap.get(name).outlets;
        }
        if (set && set.size) {
            set.clear();
            return true;
        }
        return false;
    }
    postRootMessage(data, transfer) {
        this.relayMessage(this.rootOutlets, data, transfer);
    }
    getHandler(name) {
        return (event) => {
            const node = this.channelMap.get(name);
            if (node) {
                const transfer = (event.ports && event.ports.length) ? Array.from(event.ports) : [];
                this.relayMessage(node.outlets, transfer);
            }
        };
    }
    relayMessage(outlets, data, transfer) {
        if (outlets && outlets.size) {
            outlets.forEach((o) => {
                const onode = this.channelMap.get(o);
                if (onode) {
                    onode.channel.port1.postMessage(data, transfer);
                }
            });
        }
    }
}
