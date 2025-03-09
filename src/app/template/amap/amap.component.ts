import {Component, ElementRef, Input, ViewChild} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {SmartRequestService} from '../../lib/smart-request.service';
import {load as loadMap} from '@amap/amap-jsapi-loader';
import {PageComponent, PageContent} from '../../pages/page/page.component';
import {NgIf} from '@angular/common';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzCardComponent} from 'ng-zorro-antd/card';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {NzSpinComponent} from 'ng-zorro-antd/spin';
import {SmartToolbarComponent} from '../../lib/smart-toolbar/smart-toolbar.component';
import {NzModalService} from 'ng-zorro-antd/modal';
import {Title} from '@angular/platform-browser';
import {CompareObject} from '../form/form.component';
import {isFunction} from 'rxjs/internal/util/isFunction';
import {
  GetActionLink,
  GetActionParams,
  ReplaceLinkParams,
  SmartAction
} from '../../lib/smart-table/smart-table.component';

export interface AmapContent {
  template: 'amap'

  key?: string
  secret?: string
  style?: string
  zoom?: number
  city?: number

  load_url?: string
  load_func?: string | Function | ((params: Params, request: SmartRequestService) => Promise<any>)
}

@Component({
  selector: 'app-amap',
  standalone: true,
  imports: [
    NgIf,
    NzButtonComponent,
    NzCardComponent,
    NzIconDirective,
    NzSpinComponent,
    SmartToolbarComponent
  ],
  templateUrl: './amap.component.html',
  styleUrl: './amap.component.scss'
})
export class AmapComponent {
  @Input() app!: string
  @Input() page!: string;
  @Input() content!: PageContent
  @Input() params: Params = {}

  @ViewChild("mapContainer", {static: false}) mapContainer!: ElementRef;

  map: any //AMap.Map;
  data: any[] = []
  loading = false

  constructor(protected request: SmartRequestService,
              protected route: ActivatedRoute,
              protected router: Router,
              protected ms: NzModalService,
              protected ts: Title) {
    //默认从路由中取
    this.app = route.snapshot.params['app']
    this.page = route.snapshot.params['page']
    this.params = route.snapshot.queryParams;
  }

  ngAfterViewInit() {
    //如果是input传入，则是作为组件使用
    if (this.content) {
      this.build()
      this.loadData()
    } else {
      if (this.page) this.load()
      this.route.params.subscribe(params => {
        if (this.page == params['page']) return
        this.page = params['page'];
        this.load() //重新加载
      })
      this.route.queryParams.subscribe(params => {
        if (CompareObject(params, this.params)) return
        this.params = params;
        this.loadData() //重新加载
      })
    }
  }

  load() {
    console.log("[amap] load", this.page)
    let url = "page/" + this.page
    if (this.app) url = url + this.app + "/" + this.page
    this.request.get(url).subscribe((res) => {
      if (res.error) return
      this.content = res
      if (this.content)
        this.ts.setTitle(this.content.title);
      this.build()
      this.loadData()
    })
  }

  build() {
    console.log("[amap] build", this.page)
    let content = this.content as AmapContent;
    if (!content) return

    if (typeof content.load_func == "string") {
      try {
        //@ts-ignore
        content.load_func = new Function('params', 'request', content.load_func as string)
      } catch (e) {
        console.error(e)
      }
    }

    //setTimeout(()=>this.loadMap(), 1500)
    setTimeout(()=>this.loadMap(), 50)
  }

  loadMap() {
    console.log("[amap] load map", this.page)
    let content = this.content as AmapContent;
    if (!content) return

    //@ts-ignore
    window._AMapSecurityConfig = {
      securityJsCode: content.secret || '55de9923dc16159e4750b7c743117e0d',
    };

    //加载地图，并显示
    loadMap({
      key: content.key || 'eb6a831c04b6dfedda190d6254febb58',
      version: '2.0',
      plugins: ['AMap.Icon', 'AMap.Marker'],
      AMapUI: {
        version: '1.1',
        plugins: [],
      },
    }).then((AMap) => {
      //this.element.nativeElement
      this.map = new AMap.Map(this.mapContainer.nativeElement, {
        //center: [120.301663, 31.574729],  //设置地图中心点坐标
        resizeEnable: true,
        mapStyle: content.style || 'amap://styles/normal',
        zoom: content.zoom || 12,
      });

      // AMap.plugin('AMap.Geocoder', () => {
      //     this.geocoder = new AMap.Geocoder();
      // });
      // this.geocoder = new AMap.Geocoder({ city: '' });
      // this.marker = new AMap.Marker();

      if (content.city)
        this.map.setCity(content.city)

      this.map.setFitView();
    }).catch((e) => {
      console.log(e);
    });
  }

  loadData() {
    console.log("[amap] load data", this.page)
    let content = this.content as AmapContent;
    if (!content) return

    if (isFunction(content.load_func)) {
      this.loading = true
      content.load_func(this.params, this.request).then((res: any) => {
        this.data = res;
      }).finally(()=>{
        this.loading = false
      })
    } else if (content.load_url) {
      this.loading = true
      let url = ReplaceLinkParams(content.load_url, this.params);
      this.request.get(url).subscribe(res => {
        if (res.error) return
        this.data = res.data
      }).add(()=>{
        this.loading = false
      })
    }
  }


  execute(action: SmartAction | undefined) {
    if (!action) return

    let params = GetActionParams(action, this.data)

    switch (action.type) {
      case 'link':

        let uri = GetActionLink(action, this.data)
        let query = new URLSearchParams(params).toString()
        let url = uri + '?' + query

        if (action.external)
          window.open(url)
        else
          this.router.navigateByUrl(url)
        //this.router.navigate([uri], {queryParams: params})

        break

      case 'script':
        if (typeof action.script == "string") {
          try {
            action.script = new Function("data", "request", action.script)
          } catch (e) {
            console.error(e)
          }
        }
        if (isFunction(action.script)) {
          action.script.call(this, this.data, this.request)
        }
        break

      case 'page':
        this.router.navigate(["page", action.page], {queryParams: params})
        break

      case 'dialog':
        this.ms.create({
          nzContent: PageComponent,
          nzData: {
            //app: action.app,
            page: action.page,
            params: params
          },
          nzFooter: null,
          //nzCloseIcon: 'close-circle',
          //nzMaskClosable: false
        })
        break

    }
  }

}
