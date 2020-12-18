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
  title = 'GARD POC using Skully';

  searchForm = this.fb.group({
    search: this.fb.control(''),
  });

  constructor(private fb: FormBuilder, private router: Router) {}

}
