export interface LazyKoGatheringBonus {
  bonus:          Bonus;
  condition:      Bonus;
  conditionValue: number;
  value:          number;
}

export interface Bonus {
  ko: Ko;
}

export enum Ko {
  가치상향효과ValueIntegerParameter1Value = "가치 상향 효과+<Value>IntegerParameter(1)</Value>%",
  가치상향효과ValueIntegerParameter1Value능력치반영 = "가치 상향 효과+<Value>IntegerParameter(1)</Value>%(능력치 반영)",
  기술력ValueIntegerParameter1Value이상 = "기술력 <Value>IntegerParameter(1)</Value> 이상",
  민첩성ValueIntegerParameter1Value이상 = "민첩성 <Value>IntegerParameter(1)</Value> 이상",
  상위레벨아이템획득률ValueIntegerParameter1Value = "상위 레벨 아이템 획득률+<Value>IntegerParameter(1)</Value>%",
  소장가치ValueIntegerParameter1Value = "소장 가치+<Value>IntegerParameter(1)</Value>",
  소장가치ValueIntegerParameter1Value능력치반영 = "소장 가치+<Value>IntegerParameter(1)</Value>(능력치 반영)",
  소장가치최대시승화율ValueIntegerParameter1Value능력치반영 = "소장 가치 최대 시: 승화율+<Value>IntegerParameter(1)</Value>%(능력치 반영)",
  신중한순화추가효과발생률ValueIntegerParameter1Value = "신중한 순화: 추가 효과 발생률＋<Value>IntegerParameter(1)</Value>%",
  신중한순화추가효과발생률ValueIntegerParameter1Value능력치반영 = "신중한 순화: 추가 효과 발생률＋<Value>IntegerParameter(1)</Value>%(능력치 반영)",
  연속성공ValueIntegerParameter1Value회이상 = "연속 성공 <Value>IntegerParameter(1)</Value>회 이상",
  집중검사증가율ValueIntegerParameter1Value = "집중 검사: 증가율＋<Value>IntegerParameter(1)</Value>%",
  집중검사증가율ValueIntegerParameter1Value능력치반영 = "집중 검사: 증가율＋<Value>IntegerParameter(1)</Value>%(능력치 반영)",
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
