import {Component, Input, OnInit} from "@angular/core";
import {BiDataService} from "../../service/data.service";
import {Bi, Dimension, Reference} from "../../model/bi.model";

@Component({
    selector: "erupt-bi-cascade",
    templateUrl: "./cascade.component.html",
    styles: []
})
export class CascadeComponent implements OnInit {

    @Input() dim: Dimension;

    @Input() bi: Bi;

    loading: boolean = false;

    data: any;

    constructor(private dataService: BiDataService) {

    }

    ngOnInit() {
        this.loading = true;
        this.dataService.getBiReference(this.bi.code, this.dim.id, null).subscribe((res) => {
            this.data = this.recursiveTree(res, null);
            this.data.forEach(e => {
                if (e.key == this.dim.$value) {
                    e.selected = true;
                }
            });
            this.loading = false;
        });
    }

    recursiveTree(items: Reference[], pid: any) {
        let result: any = [];
        items.forEach(item => {
            if (item.pid == pid) {
                let option: any = {
                    value: item.id,
                    label: item.title,
                    children: this.recursiveTree(items, item.id)
                };
                option.isLeaf = !option.children.length;
                result.push(option);
            }
        });
        return result;
    }

}
