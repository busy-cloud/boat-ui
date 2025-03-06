import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-chart',
  imports: [],
  templateUrl: './chart.component.html',
  standalone: true,
  styleUrl: './chart.component.scss'
})
export class ChartComponent {
  @Input() content!: any;
  @Input() page!: string;

}
