export interface ActionResult {
    success: boolean;
    // Amount of progression added to the craft
    addedProgression: number;
    // Amount of quality added to the craft
    addedQuality: number;
    // CP added to the craft (negative if removed)
    cpDifference: number;
    // Solidity added to the craft (negative if removed)
    solidityDifference: number;
    // If the action is skipped because the craft is finished
    skipped: boolean;
}
