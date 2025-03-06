import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-form',
  imports: [],
  templateUrl: './form.component.html',
  standalone: true,
  styleUrl: './form.component.scss'
})
export class FormComponent {
  @Input() content!: any;
  @Input() page!: string;

}
