import {Component} from '@angular/core';
import {NzUploadChangeParam, NzUploadComponent, NzUploadFile, NzUploadXHRArgs} from 'ng-zorro-antd/upload';
import {read, utils} from 'xlsx';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {Observable, Subscription} from 'rxjs';
import {NgForOf, NgIf} from '@angular/common';
import {
  NzTableCellDirective,
  NzTableComponent,
  NzTbodyComponent,
  NzThAddOnComponent, NzTheadComponent,
  NzThMeasureDirective, NzTrDirective
} from 'ng-zorro-antd/table';

@Component({
  selector: 'app-import',
  imports: [
    NzUploadComponent,
    NzButtonComponent,
    NgForOf,
    NgIf,
    NzTableCellDirective,
    NzTableComponent,
    NzTbodyComponent,
    NzThAddOnComponent,
    NzThMeasureDirective,
    NzTheadComponent,
    NzTrDirective
  ],
  templateUrl: './import.component.html',
  standalone: true,
  styleUrl: './import.component.scss'
})
export class ImportComponent {
  datum = []


  onUploadRequest(args: NzUploadXHRArgs): Subscription {
    console.log("onUploadRequest", args);

    const sub = new Subscription()

    const reader = new FileReader()
    reader.onloadend = () => {
      args.onSuccess?.(true, args.file, args)
    }
    reader.onerror = err =>{
      args.onError?.(err, args.file)
    }
    reader.onprogress = ev => {
      args.onProgress?.(ev, args.file)
    }
    reader.onload = (e: Event) => {
      let wb = read(reader.result)
      let sheet = wb.Sheets[wb.SheetNames[0]]
      this.datum = utils.sheet_to_json(sheet, {header: 1})
      //console.log("xlsx", aoa)
      console.log("datum", this.datum)

      // let json = utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]])
      // console.log("xlsx", json)
    }
    //@ts-ignore
    reader.readAsArrayBuffer(args.file)

    return sub
  }
}
