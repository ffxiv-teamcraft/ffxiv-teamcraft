import { of, Subject } from 'rxjs';
import { buildMoochState, resolveMoochId } from './mooch-state';

const BAIT = 27590;
const OTHER_BAIT = 2585;
const FISH_A = 36593;
const FISH_B = 36594;

const logMessage = (param1: number, param3: number) => ({
  type: 'systemLogMessage',
  parsedIpcData: {
    eventId: 0x150001,
    param1,
    actionTimeline: 0,
    param3
  }
});

const baitMessage = (baitId: number) => ({
  type: 'actorControlSelf',
  subType: 'fishingBaitMsg',
  parsedIpcData: {
    baitId
  }
});

describe('resolveMoochId', () => {

  const baits = new Set([BAIT, OTHER_BAIT]);

  it('Should ignore log messages that do not select anything', () => {
    // 1129: Nothing bites
    expect(resolveMoochId(1129, FISH_A, baits, FISH_A)).toBeNull();
    expect(resolveMoochId(1120, FISH_A, baits, FISH_A)).toBeNull();
  });

  it('Should not consider a regular bait as a mooch', () => {
    // 3522 is sent both when applying a bait and when mooching
    expect(resolveMoochId(3522, BAIT, baits, null)).toBeNull();
    expect(resolveMoochId(3522, BAIT, baits, FISH_A)).toBeNull();
  });

  it('Should return the mooched fish', () => {
    expect(resolveMoochId(1121, FISH_A, baits, FISH_A)).toBe(FISH_A);
    expect(resolveMoochId(3522, FISH_A, baits, FISH_A)).toBe(FISH_A);
  });

  it('Should reject a fish that is not the one we just caught', () => {
    expect(resolveMoochId(1121, FISH_B, baits, FISH_A)).toBeNull();
  });

  it('Should accept a mooch when the last catch is unknown', () => {
    // Happens when the capture starts while a fish is already hooked
    expect(resolveMoochId(1121, FISH_A, baits, null)).toBe(FISH_A);
  });

});

describe('buildMoochState', () => {

  const setup = () => {
    const packets$ = new Subject<any>();
    const fishCaught$ = new Subject<{ id: number }>();
    const reset$ = new Subject<void>();
    const emissions: Array<number | null> = [];
    const subscription = buildMoochState({
      packets$,
      baitIds$: of(new Set([BAIT, OTHER_BAIT])),
      fishCaught$,
      reset$
    }).subscribe(mooch => emissions.push(mooch));
    return {
      packets$,
      fishCaught$,
      reset$,
      emissions,
      subscription,
      current: () => emissions[emissions.length - 1]
    };
  };

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('Should start without any mooch', () => {
    const { current } = setup();
    expect(current()).toBeNull();
  });

  it('Should not report a mooch on the first catch of a spot', () => {
    const { packets$, fishCaught$, current } = setup();
    // Applying the bait when arriving on the spot used to leave the bait id as the current mooch
    packets$.next(logMessage(3522, BAIT));
    expect(current()).toBeNull();
    fishCaught$.next({ id: FISH_A });
    expect(current()).toBeNull();
  });

  it('Should not depend on the order the bait packets arrive in', () => {
    const first = setup();
    first.packets$.next(baitMessage(BAIT));
    first.packets$.next(logMessage(3522, BAIT));
    expect(first.current()).toBeNull();

    const second = setup();
    second.packets$.next(logMessage(3522, BAIT));
    second.packets$.next(baitMessage(BAIT));
    expect(second.current()).toBeNull();
  });

  it('Should report the fish we mooched with', () => {
    const { packets$, fishCaught$, current } = setup();
    fishCaught$.next({ id: FISH_A });
    jest.advanceTimersByTime(750);
    packets$.next(logMessage(1121, FISH_A));
    expect(current()).toBe(FISH_A);
    // The mooch must still be there when the fish it caught is reported
    fishCaught$.next({ id: FISH_B });
    expect(current()).toBe(FISH_A);
  });

  it('Should handle the mooch being sent as a bait application', () => {
    const { packets$, fishCaught$, current } = setup();
    fishCaught$.next({ id: FISH_A });
    jest.advanceTimersByTime(750);
    packets$.next(logMessage(3522, FISH_A));
    expect(current()).toBe(FISH_A);
  });

  it('Should not let the bait packet sent while mooching erase the mooch', () => {
    const { packets$, fishCaught$, current } = setup();
    fishCaught$.next({ id: FISH_A });
    jest.advanceTimersByTime(750);
    packets$.next(logMessage(1121, FISH_A));
    // Mooching also sends a bait packet, holding the fish id instead of a bait one
    packets$.next(baitMessage(FISH_A));
    expect(current()).toBe(FISH_A);
  });

  it('Should drop the mooch when the bait is changed', () => {
    const { packets$, fishCaught$, current } = setup();
    fishCaught$.next({ id: FISH_A });
    jest.advanceTimersByTime(750);
    packets$.next(logMessage(1121, FISH_A));
    packets$.next(baitMessage(OTHER_BAIT));
    expect(current()).toBeNull();
  });

  it('Should drop the mooch on reset and once the catch is over', () => {
    const withReset = setup();
    withReset.fishCaught$.next({ id: FISH_A });
    jest.advanceTimersByTime(750);
    withReset.packets$.next(logMessage(1121, FISH_A));
    withReset.reset$.next();
    expect(withReset.current()).toBeNull();

    const withCatch = setup();
    withCatch.fishCaught$.next({ id: FISH_A });
    jest.advanceTimersByTime(750);
    withCatch.packets$.next(logMessage(1121, FISH_A));
    withCatch.fishCaught$.next({ id: FISH_B });
    jest.advanceTimersByTime(750);
    expect(withCatch.current()).toBeNull();
  });

  it('Should not emit the same state twice in a row', () => {
    const { packets$, reset$, emissions } = setup();
    packets$.next(logMessage(3522, BAIT));
    reset$.next();
    packets$.next(baitMessage(OTHER_BAIT));
    expect(emissions).toEqual([null]);
  });

});
