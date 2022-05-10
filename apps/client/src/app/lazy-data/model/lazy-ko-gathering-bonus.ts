export interface LazyKoGatheringBonus {
  value:          number;
  conditionValue: number;
  bonus:          Bonus;
  condition:      Bonus;
}

export interface Bonus {
  ko: Ko;
}

export enum Ko {
  기술력ValueIntegerParameter1Value이상 = "기술력 <Value>IntegerParameter(1)</Value> 이상",
  민첩성ValueIntegerParameter1Value이상 = "민첩성 <Value>IntegerParameter(1)</Value> 이상",
  상위레벨아이템획득률ValueIntegerParameter1Value = "상위 레벨 아이템 획득률+<Value>IntegerParameter(1)</Value>%",
  연속성공ValueIntegerParameter1Value회이상 = "연속 성공 <Value>IntegerParameter(1)</Value>회 이상",
  채집횟수내구도ValueIntegerParameter1Value = "채집 횟수/내구도+<Value>IntegerParameter(1)</Value>",
  채집횟수내구도ValueIntegerParameter1Value능력치반영 = "채집 횟수/내구도+<Value>IntegerParameter(1)</Value>(능력치 반영)",
  최대GPValueIntegerParameter1Value이상 = "최대 GP <Value>IntegerParameter(1)</Value> 이상",
  하위레벨아이템획득률ValueIntegerParameter1Value = "하위 레벨 아이템 획득률+<Value>IntegerParameter(1)</Value>%",
  획득력ValueIntegerParameter1Value이상 = "획득력 <Value>IntegerParameter(1)</Value> 이상",
  획득률ValueIntegerParameter1Value = "(획득률+<Value>IntegerParameter(1)</Value>%)",
  획득수ValueIntegerParameter1Value = "획득 수+<Value>IntegerParameter(1)</Value>",
  획득수ValueIntegerParameter1Value개능력치반영 = "획득 수+<Value>IntegerParameter(1)</Value>개(능력치 반영)",
  획득수보너스발생률ValueIntegerParameter1Value = "획득 수 보너스 발생률+<Value>IntegerParameter(1)</Value>%",
  획득수보너스발생률ValueIntegerParameter1Value능력치반영 = "획득 수 보너스 발생률+<Value>IntegerParameter(1)</Value>%(능력치 반영)",
}
