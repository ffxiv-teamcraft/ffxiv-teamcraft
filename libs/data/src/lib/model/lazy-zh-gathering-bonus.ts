export interface LazyZhGatheringBonus {
  bonus:          Bonus;
  condition:      Bonus;
  conditionValue: number;
  value:          number;
}

export interface Bonus {
  zh: Zh;
}

export enum Zh {
  价值提升ValueIntegerParameter1Value = "价值提升＋<Value>IntegerParameter(1)</Value>%",
  价值提升ValueIntegerParameter1Value上升型 = "价值提升＋<Value>IntegerParameter(1)</Value>%（上升型）",
  低于自身等级道具获得率ValueIntegerParameter1Value = "低于自身等级道具获得率＋<Value>IntegerParameter(1)</Value>%",
  慎重提纯追加效果发生率ValueIntegerParameter1Value = "慎重提纯：追加效果发生率＋<Value>IntegerParameter(1)</Value>%",
  慎重提纯追加效果发生率ValueIntegerParameter1Value上升型 = "慎重提纯：追加效果发生率＋<Value>IntegerParameter(1)</Value>%（上升型）",
  收藏价值ValueIntegerParameter1Value = "收藏价值＋<Value>IntegerParameter(1)</Value>",
  收藏价值ValueIntegerParameter1Value上升型 = "收藏价值＋<Value>IntegerParameter(1)</Value>（上升型）",
  收藏价值最大时升华率ValueIntegerParameter1Value上升型 = "收藏价值最大时：升华率＋<Value>IntegerParameter(1)</Value>%（上升型）",
  灵巧ValueIntegerParameter1Value以上 = "灵巧 <Value>IntegerParameter(1)</Value>以上",
  获得力ValueIntegerParameter1Value以上 = "获得力 <Value>IntegerParameter(1)</Value>以上",
  获得数ValueIntegerParameter1Value个 = "获得数＋<Value>IntegerParameter(1)</Value>个",
  获得数ValueIntegerParameter1Value个上升型 = "获得数＋<Value>IntegerParameter(1)</Value>个（上升型）",
  获得率ValueIntegerParameter1Value = "获得率＋<Value>IntegerParameter(1)</Value>%",
  连锁ValueIntegerParameter1Value以上 = "连锁 <Value>IntegerParameter(1)</Value>以上",
  采集力上限ValueIntegerParameter1Value以上 = "采集力上限 <Value>IntegerParameter(1)</Value>以上",
  采集次数耐久ValueIntegerParameter1Value次 = "采集次数/耐久＋<Value>IntegerParameter(1)</Value>次",
  采集次数耐久ValueIntegerParameter1Value次上升型 = "采集次数/耐久＋<Value>IntegerParameter(1)</Value>次（上升型）",
  鉴别力ValueIntegerParameter1Value以上 = "鉴别力 <Value>IntegerParameter(1)</Value>以上",
  集中检查上升率ValueIntegerParameter1Value = "集中检查：上升率＋<Value>IntegerParameter(1)</Value>%",
  集中检查上升率ValueIntegerParameter1Value上升型 = "集中检查：上升率＋<Value>IntegerParameter(1)</Value>%（上升型）",
  额外采集奖励发生率ValueIntegerParameter1Value = "额外采集奖励发生率＋<Value>IntegerParameter(1)</Value>%",
  额外采集奖励发生率ValueIntegerParameter1Value上升型 = "额外采集奖励发生率＋<Value>IntegerParameter(1)</Value>%（上升型）",
  高于自身等级道具获得率ValueIntegerParameter1Value = "高于自身等级道具获得率＋<Value>IntegerParameter(1)</Value>%",
}
