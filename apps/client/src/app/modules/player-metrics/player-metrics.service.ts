import { Inject, Injectable } from '@angular/core';
import { merge, Subject } from 'rxjs';
import { PLAYER_METRICS_PROBES, PlayerMetricProbe } from './probes/player-metric-probe';
import { takeUntil } from 'rxjs/operators';
import { ProbeReport } from './model/probe-report';
import { IpcService } from '../../core/electron/ipc.service';

@Injectable({
  providedIn: 'root'
})
export class PlayerMetricsService {

  private stop$ = new Subject<void>();

  private _logs: ProbeReport[] = [];

  public get logs(): ProbeReport[] {
    return this._logs;
  }

  private buffer: ProbeReport[] = [];

  private started = false;

  constructor(private ipc: IpcService, @Inject(PLAYER_METRICS_PROBES) private probes: PlayerMetricProbe[]) {
    setInterval(() => {
      this.saveLogs();
    }, 60000);
    this.ipc.on('metrics:loaded', (e, data) => {
      this._logs = data.split('|')
        .map(row => {
          const parsed = row.split(';');
          return {
            timestamp: +parsed[0],
            type: +parsed[1],
            data: parsed[2].split(',').map(n => +n)
          };
        });
    });
  }

  public start(): void {
    if (this.started) {
      return;
    }
    merge(...this.probes.map(probe => probe.getReports()))
      .pipe(
        takeUntil(this.stop$)
      )
      .subscribe(report => {
        this.handleReport(report);
      });
    this.started = true;
  }

  public stop(): void {
    this.stop$.next();
    this.started = false;
  }

  public load(from: Date, to: Date): void {
    this.ipc.send('metrics:load', { from, to });
  }

  private handleReport(report: ProbeReport): void {
    report.timestamp = Math.floor(Date.now() / 1000);
    this.buffer.push(report);
    this.logs.push(report);
  }

  private saveLogs(): void {
    // prepare a clone to work on, so we don't overwrite data registered while saving.
    const logs = [...this.buffer];
    this.buffer = [];
    const dataString = logs.map(row => `${row.timestamp};${row.type};${row.data.join(',')}`).join('|');
    this.ipc.send('metrics:persist', dataString);
  }
}
