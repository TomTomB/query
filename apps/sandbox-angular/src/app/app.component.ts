import { Component, OnInit } from '@angular/core';
import { ExecuteOptions } from '@tomtomb/query';
import { getPost } from './query';
import { Post } from './types';

@Component({
  selector: 'tomtomb-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'sandbox-angular';

  post?: Post;
  postError?: unknown;

  ngOnInit(): void {
    this.executeGetPost(1);
    this.executeGetPost(1, { abortPrevious: true });
  }

  executeGetPost(id: number, options?: ExecuteOptions) {
    getPost
      .execute({
        args: { pathParams: { id } },
        options,
      })
      .then((p) => (this.post = p))
      .catch((e) => (this.postError = e));
  }
}
