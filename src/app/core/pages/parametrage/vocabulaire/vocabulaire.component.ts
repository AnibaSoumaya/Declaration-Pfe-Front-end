import { Component } from '@angular/core';
import { MenuItem, SelectItem } from 'primeng/api';
import { Product } from 'src/app/demo/api/product';
import { ProductService } from 'src/app/demo/service/product.service';

@Component({
  selector: 'app-vocabulaire',
  templateUrl: './vocabulaire.component.html',
})
export class VocabulaireComponent {
   products: Product[] = [];
   sortOptions: SelectItem[] = [];
   sortOrder: number = 0;
   sortField: string = '';
   sourceCities: any[] = [];
   targetCities: any[] = [];
   orderCities: any[] = [];

   selectedDrop: SelectItem = { value: '' };



   constructor(private productService: ProductService) { }

   ngOnInit() {
       this.productService.getProducts().then(data => this.products = data);

       this.sourceCities = [
           { name: 'San Francisco', code: 'SF' },
           { name: 'London', code: 'LDN' },
           { name: 'Paris', code: 'PRS' },
           { name: 'Istanbul', code: 'IST' },
           { name: 'Berlin', code: 'BRL' },
           { name: 'Barcelona', code: 'BRC' },
           { name: 'Rome', code: 'RM' }
       ];



       this.targetCities = [];
       this.orderCities = [...this.sourceCities];

       this.sortOptions = [
           { label: 'Price High to Low', value: '!price' },
           { label: 'Price Low to High', value: 'price' }
       ];
   }

   onSortChange(event: any) {
       const value = event.value;
       if (value.indexOf('!') === 0) {
           this.sortOrder = -1;
           this.sortField = value.substring(1);
       } else {
           this.sortOrder = 1;
           this.sortField = value;
       }
   }
}
