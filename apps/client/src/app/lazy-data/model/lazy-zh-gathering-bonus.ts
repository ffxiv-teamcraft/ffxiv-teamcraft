export interface LazyZhGatheringBonus {
  value:          number;
  conditionValue: number;
  bonus:          Bonus;
  condition:      Bonus;
}

export interface Bonus {
  zh: Zh;
}

export enum Zh {
  低于自身等级道具获得率ValueIntegerParameter1Value = "低于自身等级道具获得率＋<Value>IntegerParameter(1)</Value>%",
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
  额外采集奖励发生率ValueIntegerParameter1Value = "额外采集奖励发生率＋<Value>IntegerParameter(1)</Value>%",
  额外采集奖励发生率ValueIntegerParameter1Value上升型 = "额外采集奖励发生率＋<Value>IntegerParameter(1)</Value>%（上升型）",
  高于自身等级道具获得率ValueIntegerParameter1Value = "高于自身等级道具获得率＋<Value>IntegerParameter(1)</Value>%",
}
