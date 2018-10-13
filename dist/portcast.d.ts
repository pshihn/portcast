export declare class PortCast {
    private readonly channelMap;
    private readonly rootOutlets;
    addChannel(name: string, outlets?: string[], channel?: MessageChannel): MessageChannel;
    removeChannel(name: string, closePort?: boolean): boolean;
    getOutlets(name: string): Set<string> | undefined;
    postRootMessage(data: any, transfer?: Transferable[]): void;
    private getHandler;
    private relayMessage;
}
