// Source: https://github.com/goatcorp/Dalamud/blob/9e0bb1623a86f56efa9a8f3af373096f6331cfbf/Dalamud/Game/Text/SeStringHandling/Payload.cs#L292
export enum SeStringChunkType {
  If = 0x08,
  Switch = 0x09,
  IfEquals = 0x0C,
  NewLine = 0x10,
  Icon = 0x12,
  EmphasisItalic = 0x1A,
  Nbsp = 0x1D,
  SeHyphen = 0x1F,
  Interactable = 0x27,
  AutoTranslateKey = 0x2E,
  UIForeground = 0x48,
  UIGlow = 0x49,
}
