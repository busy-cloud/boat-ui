import {Component, inject} from '@angular/core';
import {NzUploadComponent, NzUploadXHRArgs} from 'ng-zorro-antd/upload';
import {read, utils} from 'xlsx';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {Subscription} from 'rxjs';
import {NgForOf} from '@angular/common';
import {
  NzTableCellDirective,
  NzTableComponent,
  NzTbodyComponent,
  NzTheadComponent,
  NzTrDirective
} from 'ng-zorro-antd/table';
import {TemplateBase} from '../template-base.component';
import {NzCardComponent} from 'ng-zorro-antd/card';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {NzSpinComponent} from 'ng-zorro-antd/spin';
import {ImportContent} from '../template';
import {isFunction} from 'rxjs/internal/util/isFunction';
import {LinkReplaceParams} from '../../lib/utils';
import {NzSelectComponent} from 'ng-zorro-antd/select';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-import',
  imports: [
    NzUploadComponent,
    NzButtonComponent,
    NgForOf,
    NzTableCellDirective,
    NzTableComponent,
    NzTbodyComponent,
    NzTheadComponent,
    NzTrDirective,
    NzCardComponent,
    NzIconDirective,
    NzSpinComponent,
    NzSelectComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './import.component.html',
  standalone: true,
  styleUrl: './import.component.scss'
})
export class ImportComponent extends TemplateBase {
  datum: any = []

  group: FormGroup = new FormGroup([])
  options: any = [{value: -1, label: '-'}]

  fb = inject(FormBuilder)
  headers: any = {}

  onMount() {
    console.log("[import]", "onMount")

    const content = this.content as ImportContent
    if (!content) return

    this.buildForm()
  }

  onUploadRequest = (args: NzUploadXHRArgs): Subscription => {
    console.log("onUploadRequest", args);
    //this.datum = [1,2,3,4,4,]

    const sub = new Subscription()
    const reader = new FileReader()
    reader.onload = () => {
      //args.onSuccess?.(true, args.file, args)
    }
    reader.onerror = err => {
      args.onError?.(err, args.file)
    }
    reader.onprogress = ev => {
      args.onProgress?.(ev, args.file)
    }
    reader.onloadend = (e: Event) => {
      args.onSuccess?.(true, args.file, args)

      let wb = read(reader.result)
      let sheet = wb.Sheets[wb.SheetNames[0]]
      let aoa = utils.sheet_to_json(sheet, {header: 1})
      this.datum = aoa

      //this.buildForm()
      this.findValues()
    }
    //@ts-ignore
    reader.readAsArrayBuffer(args.file)
    return sub
  }

  buildForm() {
    const content = this.content as ImportContent
    if (!content) return

    let group: any = {}
    content.columns.forEach(c => {
      group[c.key] = new FormControl(-1) //[-1];
    })
    this.group = this.fb.group(group)

  }

  findValues() {
    let row: any = this.datum[0] || []

    this.options = [{value: -1, label: '-'}]
    row.forEach((h: string, i: number) => {
      let ss = h.split("/")
      let key = (ss.length > 1) ? ss[1] : ss[0]

      //识别列名
      let c = this.group.get(key)
      if (c) {
        c.setValue(i)
      }
      //this.headers[key] = i

      this.options.push({value: i, label: h,})
    })
  }

  submitting = false;

  submit() {
    if (this.submitting) return
    console.log("[import] submit", this.page)
    const content = this.content as ImportContent
    if (!content) return

    if (typeof content.submit == "string" && content.submit.length > 0) {
      try {
        content.submit = new Function("data", content.submit)
      } catch (e) {
        console.error(e)
      }
    }
    if (isFunction(content.submit)) {
      this.submitting = true
      content.submit.call(this, this.data).then((res: any) => {
        //this.data = res;
        //this.ns.success("提示", "提交成功")
      }).finally(() => {
        this.submitting = false
      })
    } else if (content.submit_api) {
      this.submitting = true
      let url = LinkReplaceParams(content.submit_api, this.params);


      //TODO 这里开始上传
      this.request.post(url, {}).subscribe(res => {
        if (res.error) return
        this.data = res.data
        //this.ns.success("提示", "提交成功")

      }).add(() => {
        this.submitting = false
      })
    }
  }


}
