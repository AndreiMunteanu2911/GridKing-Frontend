import { Component, input } from '@angular/core';

@Component({
  selector: 'app-error-message',
  template: `@if (message()) { <p class="error-message" role="alert">{{ message() }}</p> }`,
  host: { '[style.display]': 'message() ? "block" : "none"' },
})
export class ErrorMessageComponent {
  readonly message = input('');
}
