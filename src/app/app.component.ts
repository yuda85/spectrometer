import { Component } from '@angular/core';
import { Point } from '@arction/lcjs';

@Component({
  selector: 'app-root',
  template: `
  <div>
    <app-chart
      [points]="this.points"
    ></app-chart>
  </div>`,
  styles: ['div { height: 100vh }']
})

export class AppComponent {
  points: Point[] = [
    { x: 0, y: 0 },
    { x: 1, y: 7 },
    { x: 2, y: 3 },
    { x: 3, y: 10 }
  ];
}
