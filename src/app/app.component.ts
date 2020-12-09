import { Component, ViewEncapsulation } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent {
  title = 'ngx-gard-skully';

  searchForm = this.fb.group({
    search: this.fb.control(''),
  });

  constructor(private fb: FormBuilder, private router: Router) {}

  search() {
    this.router.navigate(['search'], {
      queryParams: { query: this.searchForm.value.search },
    });
  }
}
