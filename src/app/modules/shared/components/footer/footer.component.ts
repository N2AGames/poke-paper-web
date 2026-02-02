import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
  version = '1.0.0';
  creator = 'n2agames';
  repositoryUrl = 'https://github.com/n2agames/poke-paper-web';
}
