import {from, Observable, Subject, Subscription} from "rxjs";
import {delay, map, mergeMap} from "rxjs/operators";
import axios from "axios";
import axiosRetry from "axios-retry";


const UNIVERSALIS_REQ_PER_SECOND = 13;
const CONCURRENCY = 1;

axiosRetry(axios, {retries: 3, retryDelay: c => c * 1000})

const queue$ = new Subject<{ url: string, res$: Subject<any> }>();

let avgResponseTime = 0;
const requestsDone: number[] = [];

let queueSub: Subscription | null = initQueue();

// Start the queue consumer

function initQueue(): Subscription {
    return queue$.pipe(
        mergeMap(({url, res$}) => {
            const delayMs = Math.max(Math.ceil(CONCURRENCY * 1000 / UNIVERSALIS_REQ_PER_SECOND) - avgResponseTime, 0);
            const start = Date.now();
            return from(axios.get(url)).pipe(
                map(res => {
                    requestsDone.push(Date.now() - start);
                    avgResponseTime = requestsDone.reduce((acc, value) => acc + value, 0) / (requestsDone.length || 1);
                    return {
                        res,
                        res$
                    };
                }),
                delay(delayMs)
            );
        }, CONCURRENCY)
    ).subscribe(({res, res$}) => {
        res$.next(res.data);
        res$.complete();
    });
}

export function doUniversalisRequest(url: string): Observable<any> {
    if (!queueSub) {
        initQueue();
    }
    const res$ = new Subject();
    queue$.next({
        url,
        res$
    });
    return res$;
}

export function closeUniversalisQueue(): void {
    if (queueSub) {
        queueSub.unsubscribe();
        queueSub = null;
    }
}
