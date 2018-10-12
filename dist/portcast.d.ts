export declare class PortCast {
    private readonly channelMap;
    private readonly rootOutlets;
    addChannel(name: string, channel?: MessageChannel, outlets?: string[]): MessageChannel;
    removeChannel(name: string, closePort?: boolean): boolean;
    addOutlet(name: string, ...outlets: string[]): boolean;
    removeOutlets(name: string, ...outlets: string[]): boolean;
    clearOutlets(name: string): boolean;
    postRootMessage(data: any, transfer?: Transferable[]): void;
    private getHandler;
    private relayMessage;
}
