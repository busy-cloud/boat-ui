import {Component, ElementRef, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {SmartRequestService} from '../../lib/smart-request.service';
import {load as loadMap} from '@amap/amap-jsapi-loader';
import {NgIf} from '@angular/common';
import {NzButtonComponent} from 'ng-zorro-antd/button';
import {NzCardComponent} from 'ng-zorro-antd/card';
import {NzIconDirective} from 'ng-zorro-antd/icon';
import {NzSpinComponent} from 'ng-zorro-antd/spin';
import {SmartToolbarComponent} from '../../lib/smart-toolbar/smart-toolbar.component';
import {NzModalService} from 'ng-zorro-antd/modal';
import {Title} from '@angular/platform-browser';
import {TemplateBase} from '../template-base.component';
import {AmapContent} from '../template';

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
  styleUrl: './amap.component.scss',
  inputs: ['app', 'page', 'content', 'params', 'data']
})
export class AmapComponent extends TemplateBase {

  @ViewChild("mapContainer", {static: false}) mapContainer!: ElementRef;

  map: any //AMap.Map;
  mapHeight = "200px"


  constructor(request: SmartRequestService, modal: NzModalService, route: ActivatedRoute, router: Router, title: Title) {
    super(request, modal, route, router, title)
  }

  override build() {
    console.log("[amap] build", this.page)
    let content = this.content as AmapContent;
    if (!content) return


    //初始化高度
    if (typeof this.content.height == "string") {
      this.mapHeight = this.content.height
    } else if (typeof this.content.height == "number") {
      this.mapHeight = this.content.height + "px"
    } else {
      this.mapHeight = "200px"
    }

    //setTimeout(()=>this.loadMap(), 1500)
    setTimeout(() => this.loadMap(), 50)
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
}
