import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-info',
  imports: [],
  templateUrl: './info.component.html',
  standalone: true,
  styleUrl: './info.component.scss'
})
export class InfoComponent {
  @Input() content!: any;
  @Input() page!: string;

}
